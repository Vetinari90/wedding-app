export const weddingConfig = {
  couple: process.env.WEDDING_COUPLE ?? "Anna & Petr",
  date: process.env.WEDDING_DATE ?? "2026-06-20",
  venue: process.env.WEDDING_VENUE ?? "Zámek Loučeň",
};

export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("cs-CZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
