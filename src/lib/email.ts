import { Resend } from "resend";
import { buildConfirmationEmail } from "./emailTemplate";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

export async function sendConfirmationEmail(
  to: string,
  guestName: string,
  stay: string | null = null,
): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping send");
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const { subject, html, text } = buildConfirmationEmail(guestName, stay);

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    console.error("[email] exception:", e);
    return { ok: false, error: String(e) };
  }
}
