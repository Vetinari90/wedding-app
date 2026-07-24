import { NextResponse } from "next/server";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { sendReminderToAll } from "@/lib/reminderSender";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Denní cron job. Konfigurován v `vercel.json` a chráněný `CRON_SECRET`,
 * který Vercel automaticky injektuje jako `Authorization: Bearer $CRON_SECRET`.
 *
 * Odešle připomínku POUZE pokud:
 *   1) reminder_active === "true"
 *   2) reminder_send_date == dnešní datum (UTC YYYY-MM-DD)
 *   3) ještě nebyla dnes odeslána (idempotence)
 * Jinak jen vrátí "skipped" s důvodem.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json(
        { status: "unauthorized" },
        { status: 401 },
      );
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const active = await getSetting(SETTING_KEYS.reminderActive);
  const scheduleDate = await getSetting(SETTING_KEYS.reminderSendDate);
  const lastSent = await getSetting(SETTING_KEYS.reminderLastSentAt);

  if (active !== "true") {
    return NextResponse.json({
      status: "skipped",
      reason: "automatické odesílání není aktivní",
      today,
    });
  }
  if (!scheduleDate) {
    return NextResponse.json({
      status: "skipped",
      reason: "není nastavené datum odeslání",
      today,
    });
  }
  if (scheduleDate !== today) {
    return NextResponse.json({
      status: "skipped",
      reason: "dnešní datum se neshoduje s naplánovaným",
      today,
      scheduleDate,
    });
  }
  if (lastSent && lastSent.slice(0, 10) === today) {
    return NextResponse.json({
      status: "skipped",
      reason: "již dnes odesláno",
      lastSent,
    });
  }

  const result = await sendReminderToAll();
  return NextResponse.json({ status: "sent", ...result });
}
