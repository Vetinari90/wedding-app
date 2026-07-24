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

  // Tasks (Co zařídit)
  await c.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      planned_cost INTEGER NOT NULL DEFAULT 0,
      actual_cost INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Schedule (Harmonogram svatebního dne)
  await c.execute(`
    CREATE TABLE IF NOT EXISTS schedule_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      time TEXT NOT NULL,
      activity TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Settings (key-value): schedule for reminder, last-sent timestamps, etc.
  await c.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

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

// ============================================
// TASKS (Co zařídit)
// ============================================

export type TaskStatus = "new" | "in_progress" | "done";

export type TaskRow = {
  id: number;
  name: string;
  status: TaskStatus;
  planned_cost: number;
  actual_cost: number;
  sort_order: number;
  created_at: string;
};

export async function listTasks(): Promise<TaskRow[]> {
  const db = await getDb();
  const res = await db.execute(
    "SELECT * FROM tasks ORDER BY sort_order ASC, id ASC",
  );
  return res.rows as unknown as TaskRow[];
}

export async function insertTask(t: {
  name: string;
  status?: TaskStatus;
  planned_cost?: number;
  actual_cost?: number;
}): Promise<void> {
  const db = await getDb();
  const r = await db.execute(
    "SELECT COALESCE(MAX(sort_order), 0) + 10 AS next FROM tasks",
  );
  const nextOrder = Number(
    (r.rows[0] as unknown as { next: number }).next,
  );
  await db.execute({
    sql: `INSERT INTO tasks (name, status, planned_cost, actual_cost, sort_order)
          VALUES (?, ?, ?, ?, ?)`,
    args: [
      t.name,
      t.status ?? "new",
      t.planned_cost ?? 0,
      t.actual_cost ?? 0,
      nextOrder,
    ],
  });
}

export async function updateTaskFields(
  id: number,
  t: Partial<{
    name: string;
    status: TaskStatus;
    planned_cost: number;
    actual_cost: number;
  }>,
): Promise<void> {
  const sets: string[] = [];
  const args: InValue[] = [];
  if (t.name !== undefined) {
    sets.push("name = ?");
    args.push(t.name);
  }
  if (t.status !== undefined) {
    sets.push("status = ?");
    args.push(t.status);
  }
  if (t.planned_cost !== undefined) {
    sets.push("planned_cost = ?");
    args.push(t.planned_cost);
  }
  if (t.actual_cost !== undefined) {
    sets.push("actual_cost = ?");
    args.push(t.actual_cost);
  }
  if (sets.length === 0) return;
  args.push(id);
  const db = await getDb();
  await db.execute({
    sql: `UPDATE tasks SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
}

export async function deleteTaskById(id: number): Promise<void> {
  const db = await getDb();
  await db.execute({ sql: "DELETE FROM tasks WHERE id = ?", args: [id] });
}

// ============================================
// SCHEDULE (Harmonogram)
// ============================================

export type ScheduleItemRow = {
  id: number;
  time: string;
  activity: string;
  sort_order: number;
  created_at: string;
};

export async function listScheduleItems(): Promise<ScheduleItemRow[]> {
  const db = await getDb();
  const res = await db.execute(
    "SELECT * FROM schedule_items ORDER BY sort_order ASC, id ASC",
  );
  return res.rows as unknown as ScheduleItemRow[];
}

export async function insertScheduleItem(item: {
  time: string;
  activity: string;
  sort_order?: number;
}): Promise<void> {
  const db = await getDb();
  let order = item.sort_order;
  if (order === undefined) {
    const r = await db.execute(
      "SELECT COALESCE(MAX(sort_order), 0) + 10 AS next FROM schedule_items",
    );
    order = Number((r.rows[0] as unknown as { next: number }).next);
  }
  await db.execute({
    sql: `INSERT INTO schedule_items (time, activity, sort_order)
          VALUES (?, ?, ?)`,
    args: [item.time, item.activity, order],
  });
}

export async function updateScheduleItem(
  id: number,
  item: Partial<{ time: string; activity: string }>,
): Promise<void> {
  const sets: string[] = [];
  const args: InValue[] = [];
  if (item.time !== undefined) {
    sets.push("time = ?");
    args.push(item.time);
  }
  if (item.activity !== undefined) {
    sets.push("activity = ?");
    args.push(item.activity);
  }
  if (sets.length === 0) return;
  args.push(id);
  const db = await getDb();
  await db.execute({
    sql: `UPDATE schedule_items SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
}

export async function deleteScheduleItemById(id: number): Promise<void> {
  const db = await getDb();
  await db.execute({
    sql: "DELETE FROM schedule_items WHERE id = ?",
    args: [id],
  });
}
