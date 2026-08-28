import { getDb } from "./db";

/**
 * Simple string-typed key/value store persisted in the `settings` table.
 * Used for things like the reminder-email schedule and idempotency markers.
 */

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  const res = await db.execute({
    sql: "SELECT value FROM settings WHERE key = ?",
    args: [key],
  });
  const row = res.rows[0];
  if (!row) return null;
  const value = (row as unknown as { value: string | null }).value;
  return value ?? null;
}

export async function setSetting(
  key: string,
  value: string | null,
): Promise<void> {
  const db = await getDb();
  if (value === null) {
    await db.execute({
      sql: "DELETE FROM settings WHERE key = ?",
      args: [key],
    });
    return;
  }
  await db.execute({
    sql: `INSERT INTO settings (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    args: [key, value],
  });
}

/**
 * Well-known keys — keep in one place so we can refactor easily.
 */
export const SETTING_KEYS = {
  reminderActive: "reminder_active", // "true" | "false"
  reminderSendDate: "reminder_send_date", // ISO YYYY-MM-DD
  reminderLastSentAt: "reminder_last_sent_at", // ISO datetime
  reminderLastResult: "reminder_last_result", // JSON with SendResult
  thankYouLastSentAt: "thank_you_last_sent_at", // ISO datetime (variant: thanks)
  thankYouLastResult: "thank_you_last_result", // JSON with SendResult (variant: thanks)
  photosLastSentAt: "photos_last_sent_at", // ISO datetime (variant: photos)
  photosLastResult: "photos_last_result", // JSON with SendResult (variant: photos)
} as const;
