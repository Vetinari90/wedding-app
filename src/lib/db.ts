import { DatabaseSync, type StatementSync } from "node:sqlite";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "wedding.db");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (_db) return _db;

  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");

  db.exec(`
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
    );

    CREATE INDEX IF NOT EXISTS idx_rsvp_created_at ON rsvp(created_at DESC);
  `);

  _db = db;
  return db;
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
};

export type { StatementSync };
