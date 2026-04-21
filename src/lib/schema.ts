import { z } from "zod";
import { ALLOWED_DRINKS } from "./drinks";

export const rsvpSchema = z
  .object({
    name: z.string().trim().min(2, "Zadejte prosím své jméno"),
    email: z
      .string()
      .trim()
      .min(1, "Email je povinný — pošleme na něj potvrzení")
      .email("Neplatný email"),
    phone: z.string().trim().max(40).optional(),
    attending: z.enum(["yes", "no"]),
    adults_count: z.coerce.number().int().min(1).max(10).default(1),
    children_count: z.coerce.number().int().min(0).max(10).default(0),
    companion_name: z.string().trim().max(200).optional(),
    dietary_notes: z.string().trim().max(500).optional(),
    // "need" = potřebuji ubytování (pak musí být vybraný accommodation_stay)
    // "none" = nepotřebuji, přijedu jen na jeden den
    // "" / undefined = nevyplněno
    accommodation_choice: z
      .enum(["need", "none", ""])
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    accommodation_stay: z.enum(["weekend", "sat_sun"]).optional(),
    transport_notes: z.string().trim().max(500).optional(),
    message: z.string().trim().max(1000).optional(),
  })
  .refine(
    (d) => d.attending === "no" || d.adults_count >= 1,
    { message: "Alespoň 1 dospělý", path: ["adults_count"] },
  )
  .refine(
    (d) =>
      d.attending === "no" ||
      d.accommodation_choice !== "need" ||
      d.accommodation_stay !== undefined,
    {
      message: "Vyberte prosím délku pobytu",
      path: ["accommodation_stay"],
    },
  );

export type RsvpInput = z.infer<typeof rsvpSchema>;

/**
 * Extract selected drink values from FormData. HTML posts each checked
 * checkbox as a separate entry with the same name. Anything unknown is
 * dropped — prevents smuggling arbitrary values into the DB.
 */
export function parseDrinks(formData: FormData): string[] {
  const raw = formData.getAll("drinks");
  const out: string[] = [];
  for (const v of raw) {
    const s = typeof v === "string" ? v : "";
    if (ALLOWED_DRINKS.has(s) && !out.includes(s)) out.push(s);
  }
  return out;
}
