"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { sendThankYouEmails } from "@/lib/thankYouSender";

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}

/**
 * RUČNÍ odeslání děkovného emailu. Žádný cron.
 *
 * FormData:
 *   - mode = "all" | "selected"
 *   - emails[] = seznam vybraných adres (jen když mode === "selected")
 */
export async function sendThankYouNowAction(formData: FormData) {
  await requireAdmin();
  const mode = String(formData.get("mode") ?? "all");
  if (mode === "selected") {
    const emails = formData
      .getAll("emails")
      .map((v) => String(v).trim())
      .filter(Boolean);
    if (emails.length === 0) return; // safety: nic nevybráno
    await sendThankYouEmails(emails);
  } else {
    await sendThankYouEmails();
  }
  revalidatePath("/admin/thank-you");
}
