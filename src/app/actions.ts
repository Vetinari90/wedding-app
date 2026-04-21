"use server";

import { redirect } from "next/navigation";
import { rsvpSchema, parseDrinks } from "@/lib/schema";
import { insertRsvp, listNormalizedNames, normalizeName } from "@/lib/db";
import { sendConfirmationEmail } from "@/lib/email";

const MSG_NAME_ALREADY_GUEST =
  "Pod tímto jménem už byla odeslána registrace.";
const MSG_NAME_AS_COMPANION =
  "Tento host je již uveden jako doprovod jiného hosta. Pokud jste to vy, neregistrujte se znovu.";
const MSG_COMPANION_AS_GUEST =
  "Tato osoba se již sama zaregistrovala jako host.";

export type DuplicateResult = { conflict: boolean; message: string | null };

export async function checkDuplicate(
  field: "name" | "companion_name",
  value: string,
): Promise<DuplicateResult> {
  const n = normalizeName(value);
  if (n.length < 2) return { conflict: false, message: null };

  const { guests, companions } = await listNormalizedNames();

  if (field === "name") {
    if (guests.includes(n)) {
      return { conflict: true, message: MSG_NAME_ALREADY_GUEST };
    }
    if (companions.includes(n)) {
      return { conflict: true, message: MSG_NAME_AS_COMPANION };
    }
  } else {
    if (guests.includes(n)) {
      return { conflict: true, message: MSG_COMPANION_AS_GUEST };
    }
  }
  return { conflict: false, message: null };
}

export type FormState = {
  ok: boolean;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

export async function submitRsvp(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = Object.fromEntries(formData.entries());

  const parsed = rsvpSchema.safeParse(raw);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "_";
      if (!errors[key]) errors[key] = issue.message;
    }
    return {
      ok: false,
      errors,
      values: Object.fromEntries(
        Object.entries(raw).map(([k, v]) => [k, String(v)]),
      ),
    };
  }

  const d = parsed.data;
  const attending = d.attending === "yes" ? 1 : 0;

  // Safety net: re-check duplicates on server (client can be bypassed).
  const dupErrors: Record<string, string> = {};
  const { guests, companions } = await listNormalizedNames();
  const nName = normalizeName(d.name);
  if (nName.length >= 2 && guests.includes(nName)) {
    dupErrors.name = MSG_NAME_ALREADY_GUEST;
  } else if (nName.length >= 2 && companions.includes(nName)) {
    dupErrors.name = MSG_NAME_AS_COMPANION;
  }
  if (attending === 1 && d.companion_name) {
    const nComp = normalizeName(d.companion_name);
    if (nComp.length >= 2 && guests.includes(nComp)) {
      dupErrors.companion_name = MSG_COMPANION_AS_GUEST;
    }
    // Also block if companion name equals main name
    if (nComp.length >= 2 && nComp === nName) {
      dupErrors.companion_name =
        "Doprovod nemůže mít stejné jméno jako hlavní host.";
    }
  }
  if (Object.keys(dupErrors).length > 0) {
    return {
      ok: false,
      errors: dupErrors,
      values: Object.fromEntries(
        Object.entries(raw).map(([k, v]) => [k, String(v)]),
      ),
    };
  }

  const drinks = attending === 1 ? parseDrinks(formData) : [];

  // Ubytování: pokud host nepřijde, vynulujeme. Jinak odvoz z choice+stay.
  let stay: string | null = null;
  let needed: 0 | 1 = 0;
  if (attending === 1) {
    if (d.accommodation_choice === "need" && d.accommodation_stay) {
      stay = d.accommodation_stay;
      needed = 1;
    } else if (d.accommodation_choice === "none") {
      stay = "one_day";
      needed = 0;
    }
  }

  await insertRsvp({
    name: d.name,
    email: d.email,
    phone: d.phone || null,
    attending,
    adults_count: attending === 1 ? d.adults_count : 0,
    children_count: attending === 1 ? d.children_count : 0,
    companion_name: d.companion_name || null,
    dietary_notes: d.dietary_notes || null,
    accommodation_needed: needed,
    transport_notes: d.transport_notes || null,
    message: d.message || null,
    drinks: drinks.length > 0 ? drinks.join(",") : null,
    accommodation_stay: stay,
  });

  // Best-effort — nikdy neblokovat potvrzení submitu kvůli selhání emailu.
  // Jen pokud host přijde (attending === 1).
  if (attending === 1) {
    try {
      await sendConfirmationEmail(d.email, d.name);
    } catch (e) {
      console.error("[submitRsvp] sendConfirmationEmail failed:", e);
    }
  }

  redirect("/dekujeme");
}
