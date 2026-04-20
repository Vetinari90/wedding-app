/**
 * Drink options used in both client (form) and server (DB, admin, email).
 * Kept in a separate file so the client bundle doesn't accidentally pull
 * server-only modules (fs, path) via `@/lib/db`.
 */

export const DRINK_OPTIONS = [
  { value: "pivo", label: "Pivo" },
  { value: "vino", label: "Víno" },
  { value: "tvrdy", label: "Rum / Whisky / Gin" },
  { value: "nealko", label: "Nealko" },
] as const;

export type DrinkValue = (typeof DRINK_OPTIONS)[number]["value"];

export const ALLOWED_DRINKS: ReadonlySet<string> = new Set(
  DRINK_OPTIONS.map((d) => d.value),
);

export function drinkLabel(value: string): string {
  return DRINK_OPTIONS.find((d) => d.value === value)?.label ?? value;
}
