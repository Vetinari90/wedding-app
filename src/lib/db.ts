import { createClient, type Client, type InValue } from "@libsql/client";
import path from "path";
import fs from "fs";

let _client: Client | null = null;
let _initialized = false;

function resolveUrl(): string {
  const url = process.env.TURSO_DATABASE_URL;
  if (url && url.length > 0) return url;
  // Local fallback — file DB in ./data/wedding.db.
  // Only runs when no Turso URL is configured (i.e., local dev).
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const local = path.join(dataDir, "wedding.db").replace(/\\/g, "/");
  return `file:${local}`;
}

function getClient(): Client {
  if (_client) return _client;
  const url = resolveUrl();
  const authToken = process.env.TURSO_AUTH_TOKEN;
  _client = createClient({
    url,
    authToken: authToken && authToken.length > 0 ? authToken : undefined,
  });
  return _client;
}

async function ensureSchema(c: Client): Promise<void> {
  if (_initialized) return;
  await c.execute(`
    CREATE TABLE IF NOT EXISTS rsvp (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      attending INTEGER NOT NULL,
      adults_count INTEGER NOT NULL DEFAULT 1,
      children_count INTEGER NOT NULL DEFAULT 0,
      companion_name TEXT,
      dietary_notes TEXT,
      accommodation_needed INTEGER NOT NULL DEFAULT 0,
      transport_notes TEXT,
      message TEXT
    )
  `);
  await c.execute(
    `CREATE INDEX IF NOT EXISTS idx_rsvp_created_at ON rsvp(created_at DESC)`,
  );

  // Lightweight migration: add new columns if missing (existing DBs).
  const info = await c.execute(`PRAGMA table_info(rsvp)`);
  const columns = new Set(
    (info.rows as unknown as Array<{ name: string }>).map((r) => r.name),
  );
  if (!columns.has("drinks")) {
    await c.execute(`ALTER TABLE rsvp ADD COLUMN drinks TEXT`);
  }
  if (!columns.has("accommodation_stay")) {
    await c.execute(`ALTER TABLE rsvp ADD COLUMN accommodation_stay TEXT`);
  }

  _initialized = true;
}

export async function getDb(): Promise<Client> {
  const c = getClient();
  await ensureSchema(c);
  return c;
}

export type RsvpRow = {
  id: number;
  created_at: string;
  name: string;
  email: string | null;
  phone: string | null;
  attending: 0 | 1;
  adults_count: number;
  children_count: number;
  companion_name: string | null;
  dietary_notes: string | null;
  accommodation_needed: 0 | 1;
  transport_notes: string | null;
  message: string | null;
  drinks: string | null; // CSV: "pivo,vino,..."
  accommodation_stay: string | null; // "weekend" | "sat_sun" | "one_day"
};

export const ACCOMMODATION_STAY_LABELS: Record<string, string> = {
  weekend: "Celý víkend (pá–ne)",
  sat_sun: "Sobota–neděle (obřad a přespání)",
  one_day: "Bez ubytování (jen jeden den)",
};

export function accommodationStayLabel(value: string | null): string {
  if (!value) return "—";
  return ACCOMMODATION_STAY_LABELS[value] ?? value;
}

// Re-export drink helpers from the client-safe module so existing
// server-side imports (admin, export, actions) keep working.
export { DRINK_OPTIONS, ALLOWED_DRINKS, drinkLabel } from "./drinks";
export type { DrinkValue } from "./drinks";

export async function insertRsvp(values: {
  name: string;
  email: string | null;
  phone: string | null;
  attending: 0 | 1;
  adults_count: number;
  children_count: number;
  companion_name: string | null;
  dietary_notes: string | null;
  accommodation_needed: 0 | 1;
  transport_notes: string | null;
  message: string | null;
  drinks: string | null;
  accommodation_stay: string | null;
}): Promise<void> {
  const db = await getDb();
  const args: InValue[] = [
    values.name,
    values.email,
    values.phone,
    values.attending,
    values.adults_count,
    values.children_count,
    values.companion_name,
    values.dietary_notes,
    values.accommodation_needed,
    values.transport_notes,
    values.message,
    values.drinks,
    values.accommodation_stay,
  ];
  await db.execute({
    sql: `INSERT INTO rsvp (
      name, email, phone, attending,
      adults_count, children_count, companion_name,
      dietary_notes, accommodation_needed, transport_notes, message, drinks,
      accommodation_stay
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args,
  });
}

export async function listRsvp(): Promise<RsvpRow[]> {
  const db = await getDb();
  const res = await db.execute(
    "SELECT * FROM rsvp ORDER BY created_at DESC",
  );
  return res.rows as unknown as RsvpRow[];
}

export function normalizeName(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    // eslint-disable-next-line no-misleading-character-class
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/\s+/g, " ");
}

/**
 * Return all existing names and companion names (normalized).
 * Small dataset (wedding) — loading everything is fine.
 */
export async function listNormalizedNames(): Promise<{
  guests: string[];
  companions: string[];
}> {
  const db = await getDb();
  const res = await db.execute(
    "SELECT name, companion_name FROM rsvp",
  );
  const guests: string[] = [];
  const companions: string[] = [];
  for (const row of res.rows as unknown as Array<{
    name: string;
    companion_name: string | null;
  }>) {
    if (row.name) guests.push(normalizeName(row.name));
    if (row.companion_name) companions.push(normalizeName(row.companion_name));
  }
  return { guests, companions };
}
