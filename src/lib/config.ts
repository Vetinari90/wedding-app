export const weddingConfig = {
  couple: process.env.WEDDING_COUPLE ?? "Anna & Petr",
  date: process.env.WEDDING_DATE ?? "2026-06-20",
  venue: process.env.WEDDING_VENUE ?? "Zámek Loučeň",
};

const MONTHS_CS = [
  "ledna",
  "února",
  "března",
  "dubna",
  "května",
  "června",
  "července",
  "srpna",
  "září",
  "října",
  "listopadu",
  "prosince",
];

function formatCs(d: Date): string {
  return `${d.getDate()}. ${MONTHS_CS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDate(input: string): string {
  const raw = input.trim().replace(/^["']|["']$/g, "");

  // ISO: 2026-06-20
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(raw);
  if (iso) {
    const d = new Date(+iso[1], +iso[2] - 1, +iso[3]);
    if (!isNaN(d.getTime())) return formatCs(d);
  }

  // Czech: 20.6.2026 or 20. 6. 2026
  const cs = /^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})$/.exec(raw);
  if (cs) {
    const d = new Date(+cs[3], +cs[2] - 1, +cs[1]);
    if (!isNaN(d.getTime())) return formatCs(d);
  }

  // Fallback: try native parse
  const native = new Date(raw);
  if (!isNaN(native.getTime())) return formatCs(native);

  // Last resort — return whatever the user typed
  return raw;
}
