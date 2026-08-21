import { Resend } from "resend";
import { listRsvp } from "./db";
import { buildThankYouEmail } from "./thankYouTemplate";
import { setSetting, SETTING_KEYS } from "./settings";
import type { SendResult, PerGuestResult } from "./reminderSender";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

/**
 * Odešle děkovný email hostům.
 * - Bez `filterEmails` → všem "attending" hostům s vyplněným emailem.
 * - S `filterEmails` → jen těm hostům, jejichž email je v seznamu.
 *
 * Volej pouze ze server actions — nikdy z běžného request handleru.
 */
export async function sendThankYouEmails(
  filterEmails?: string[] | null,
): Promise<SendResult> {
  const startedAt = new Date().toISOString();
  const resend = getResend();

  if (!resend) {
    const result: SendResult = {
      ranAt: startedAt,
      totalAttending: 0,
      sent: 0,
      skipped: 0,
      perGuest: [
        {
          name: "(nastavení)",
          email: null,
          ok: false,
          error: "RESEND_API_KEY není nastaveno",
        },
      ],
    };
    await setSetting(SETTING_KEYS.thankYouLastResult, JSON.stringify(result));
    return result;
  }

  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const guests = await listRsvp();
  let attending = guests.filter((g) => g.attending === 1);

  if (filterEmails && filterEmails.length > 0) {
    const allowed = new Set(
      filterEmails.map((e) => e.trim().toLowerCase()).filter(Boolean),
    );
    attending = attending.filter(
      (g) => g.email && allowed.has(g.email.toLowerCase()),
    );
  }

  // Připrav email jednou — je pro všechny stejný
  const { subject, html, text } = buildThankYouEmail();

  const perGuest: PerGuestResult[] = [];

  for (const guest of attending) {
    if (!guest.email) {
      perGuest.push({
        name: guest.name,
        email: null,
        ok: false,
        error: "chybí email",
      });
      continue;
    }

    try {
      const { error } = await resend.emails.send({
        from,
        to: guest.email,
        subject,
        html,
        text,
      });
      if (error) {
        perGuest.push({
          name: guest.name,
          email: guest.email,
          ok: false,
          error: error.message,
        });
      } else {
        perGuest.push({ name: guest.name, email: guest.email, ok: true });
      }
    } catch (e) {
      perGuest.push({
        name: guest.name,
        email: guest.email,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }

    // Šetrné na Resend rate-limit (Hobby: 2 req/s)
    await new Promise((r) => setTimeout(r, 550));
  }

  const sent = perGuest.filter((r) => r.ok).length;
  const skipped = perGuest.length - sent;

  const result: SendResult = {
    ranAt: startedAt,
    totalAttending: attending.length,
    sent,
    skipped,
    perGuest,
  };

  await setSetting(
    SETTING_KEYS.thankYouLastSentAt,
    new Date().toISOString(),
  );
  await setSetting(SETTING_KEYS.thankYouLastResult, JSON.stringify(result));

  return result;
}
