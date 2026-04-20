"use server";

import { redirect } from "next/navigation";
import { rsvpSchema } from "@/lib/schema";
import { insertRsvp } from "@/lib/db";

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

  await insertRsvp({
    name: d.name,
    email: d.email || null,
    phone: d.phone || null,
    attending,
    adults_count: attending === 1 ? d.adults_count : 0,
    children_count: attending === 1 ? d.children_count : 0,
    companion_name: d.companion_name || null,
    dietary_notes: d.dietary_notes || null,
    accommodation_needed: d.accommodation_needed ? 1 : 0,
    transport_notes: d.transport_notes || null,
    message: d.message || null,
  });

  redirect("/dekujeme");
}
