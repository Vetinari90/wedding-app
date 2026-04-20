import { z } from "zod";

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
    accommodation_needed: z
      .union([z.literal("on"), z.literal("true"), z.boolean()])
      .optional()
      .transform((v) => v === true || v === "on" || v === "true"),
    transport_notes: z.string().trim().max(500).optional(),
    message: z.string().trim().max(1000).optional(),
  })
  .refine(
    (d) => d.attending === "no" || d.adults_count >= 1,
    { message: "Alespoň 1 dospělý", path: ["adults_count"] },
  );

export type RsvpInput = z.infer<typeof rsvpSchema>;
