"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { sendThankYouEmails } from "@/lib/thankYouSender";
import type { ThankYouVariant } from "@/lib/thankYouTemplate";

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}

/**
 * RUČNÍ odeslání děkovného emailu. Žádný cron.
 *
 * Varianta se předává přes `.bind(null, variant)` na server-actionu.
 * FormData:
 *   - mode = "all" | "selected"
 *   - emails[] = seznam vybraných adres (jen když mode === "selected")
 */
export async function sendThankYouNowAction(
  variant: ThankYouVariant,
  formData: FormData,
) {
  await requireAdmin();
  const safeVariant: ThankYouVariant =
    variant === "photos" ? "photos" : "thanks";
  const mode = String(formData.get("mode") ?? "all");
  if (mode === "selected") {
    const emails = formData
      .getAll("emails")
      .map((v) => String(v).trim())
      .filter(Boolean);
    if (emails.length === 0) return; // safety: nic nevybráno
    await sendThankYouEmails(safeVariant, emails);
  } else {
    await sendThankYouEmails(safeVariant);
  }
  revalidatePath("/admin/thank-you");
}
