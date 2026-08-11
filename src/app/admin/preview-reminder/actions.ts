"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { setSetting, SETTING_KEYS } from "@/lib/settings";
import { sendReminderToAll } from "@/lib/reminderSender";

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}

/**
 * Uloží nastavení naplánovaného odeslání (checkbox + datum).
 * Neodesílá žádné maily.
 */
export async function updateReminderScheduleAction(formData: FormData) {
  await requireAdmin();
  const active = formData.get("active") === "on";
  const date = String(formData.get("date") ?? "").trim();

  await setSetting(SETTING_KEYS.reminderActive, active ? "true" : "false");
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    await setSetting(SETTING_KEYS.reminderSendDate, date);
  }
  revalidatePath("/admin/preview-reminder");
}

/**
 * Vymaže zápis o posledním odeslání — cron pak může znovu odeslat
 * (např. když bys chtěl/a naplánování zopakovat po ruční zkoušce).
 */
export async function resetReminderSentMarkerAction() {
  await requireAdmin();
  await setSetting(SETTING_KEYS.reminderLastSentAt, null);
  await setSetting(SETTING_KEYS.reminderLastResult, null);
  revalidatePath("/admin/preview-reminder");
}

/**
 * RUČNÍ odeslání — obejde cron i schedule. Volá se pouze z formuláře,
 * který má client-side confirm() dialog.
 *
 * FormData:
 *   - mode = "all" | "selected"
 *   - emails[] = seznam vybraných adres (jen když mode === "selected")
 */
export async function sendReminderNowAction(formData: FormData) {
  await requireAdmin();
  const mode = String(formData.get("mode") ?? "all");
  if (mode === "selected") {
    const emails = formData
      .getAll("emails")
      .map((v) => String(v).trim())
      .filter(Boolean);
    if (emails.length === 0) return; // safety: nic nevybráno
    await sendReminderToAll(emails);
  } else {
    await sendReminderToAll();
  }
  revalidatePath("/admin/preview-reminder");
}
