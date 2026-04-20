"use server";

import { redirect } from "next/navigation";
import { rsvpSchema } from "@/lib/schema";
import { getDb } from "@/lib/db";

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

  const db = getDb();
  db.prepare(
    `INSERT INTO rsvp (
      name, email, phone, attending,
      adults_count, children_count, companion_name,
      dietary_notes, accommodation_needed, transport_notes, message
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    d.name,
    d.email || null,
    d.phone || null,
    attending,
    attending === 1 ? d.adults_count : 0,
    attending === 1 ? d.children_count : 0,
    d.companion_name || null,
    d.dietary_notes || null,
    d.accommodation_needed ? 1 : 0,
    d.transport_notes || null,
    d.message || null,
  );

  redirect("/dekujeme");
}
