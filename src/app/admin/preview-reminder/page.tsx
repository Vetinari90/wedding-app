import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { buildReminderEmail, type ReminderStay } from "@/lib/reminderTemplate";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { listRsvp } from "@/lib/db";
import {
  updateReminderScheduleAction,
  resetReminderSentMarkerAction,
  sendReminderNowAction,
} from "./actions";
import ConfirmButton from "../ConfirmButton";

export const dynamic = "force-dynamic";

const VARIANTS: Array<{ key: ReminderStay; title: string; sub: string }> = [
  {
    key: "weekend",
    title: "Páteční varianta",
    sub: "hosté, kteří přijedou v pátek (weekend)",
  },
  {
    key: "sat_sun",
    title: "Sobotní varianta · s ubytováním",
    sub: "hosté, kteří přijedou v sobotu a zůstávají do neděle (sat_sun)",
  },
  {
    key: "one_day",
    title: "Sobotní varianta · jen 1 den",
    sub: "hosté, kteří přijedou v sobotu bez ubytování (one_day)",
  },
];

function formatCzechDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("cs-CZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: iso.length > 10 ? "2-digit" : undefined,
      minute: iso.length > 10 ? "2-digit" : undefined,
    });
  } catch {
    return iso;
  }
}

export default async function PreviewReminderPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const params = await searchParams;
  const name = (params.name?.trim() || "Anna Nováková").slice(0, 100);

  // Aktuální nastavení + statistika hostů
  const [activeRaw, scheduleDate, lastSentAt, lastResultJson, guests] =
    await Promise.all([
      getSetting(SETTING_KEYS.reminderActive),
      getSetting(SETTING_KEYS.reminderSendDate),
      getSetting(SETTING_KEYS.reminderLastSentAt),
      getSetting(SETTING_KEYS.reminderLastResult),
      listRsvp(),
    ]);
  const isActive = activeRaw === "true";
  const attendingWithEmail = guests.filter(
    (g) => g.attending === 1 && g.email,
  );
  const attendingWithoutEmail = guests.filter(
    (g) => g.attending === 1 && !g.email,
  );

  let lastResult: {
    ranAt?: string;
    totalAttending?: number;
    sent?: number;
    skipped?: number;
    perGuest?: Array<{ name: string; ok: boolean; error?: string }>;
  } | null = null;
  if (lastResultJson) {
    try {
      lastResult = JSON.parse(lastResultJson);
    } catch {
      /* ignore malformed */
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  // Default: 14 dní před 15. srpnem 2026 = 2026-08-01
  const defaultDate = scheduleDate ?? "2026-08-01";

  return (
    <main className="min-h-screen bg-wedding-cream">
      <header className="border-b border-wedding-ink/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="font-serif text-2xl">
              Připomínkový email — nastavení a náhled
            </h1>
            <p className="mt-1 text-xs text-wedding-ink/60">
              Rozeslání šablon podle <code>accommodation_stay</code> pro
              všechny přicházející hosty s vyplněným emailem.
            </p>
          </div>
          <Link
            href="/admin"
            className="text-sm text-wedding-sage hover:underline"
          >
            ← Zpět do adminu
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        {/* ===== Control panel ===== */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Automatic schedule */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="font-serif text-lg text-wedding-ink">
              Automatické odeslání
            </h2>
            <p className="mt-1 text-xs text-wedding-ink/60">
              Naplánuje odeslání na konkrétní datum. Vercel spouští cron
              každý den v 08:00 UTC (10:00 CEST) a odešle jen v den, který
              nastavíš níže.
            </p>

            <form
              action={updateReminderScheduleAction}
              className="mt-4 space-y-3"
            >
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={isActive}
                  className="h-4 w-4 accent-wedding-sage"
                />
                <span>Automatické odeslání k datu</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="w-32">Datum odeslání:</span>
                <input
                  type="date"
                  name="date"
                  defaultValue={defaultDate}
                  className="rounded border border-wedding-ink/20 px-2 py-1"
                />
              </label>
              <button
                type="submit"
                className="rounded-md bg-wedding-sage px-4 py-1.5 text-sm text-white hover:bg-wedding-sage/90"
              >
                Uložit nastavení
              </button>
            </form>

            <div className="mt-4 space-y-1 text-xs text-wedding-ink/70">
              <div>
                Stav:{" "}
                <strong
                  className={
                    isActive ? "text-wedding-sage" : "text-wedding-ink/60"
                  }
                >
                  {isActive ? "Aktivní" : "Neaktivní"}
                </strong>
              </div>
              <div>
                Naplánováno na:{" "}
                <strong>{formatCzechDate(scheduleDate)}</strong>{" "}
                <span className="text-wedding-ink/50">
                  (dnes je {formatCzechDate(today)})
                </span>
              </div>
              <div>
                Poslední odeslání:{" "}
                <strong>{formatCzechDate(lastSentAt)}</strong>
              </div>
            </div>

            {lastSentAt && (
              <div className="mt-3">
                <form action={resetReminderSentMarkerAction}>
                  <button
                    type="submit"
                    className="text-xs text-wedding-ink/50 underline hover:text-wedding-ink"
                  >
                    Zapomenout, že už bylo odesláno (umožní cronu odeslat
                    znovu)
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Manual send */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="font-serif text-lg text-wedding-ink">
              Ruční odeslání
            </h2>
            <p className="mt-1 text-xs text-wedding-ink/60">
              Odešle připomínku všem přicházejícím hostům{" "}
              <strong>okamžitě</strong>, bez ohledu na plán. Vyžaduje
              potvrzení.
            </p>

            <div className="mt-4 space-y-1 text-sm">
              <div>
                Přijde a má email:{" "}
                <strong>{attendingWithEmail.length}</strong>
              </div>
              {attendingWithoutEmail.length > 0 && (
                <div className="text-wedding-rose">
                  Přijde bez emailu:{" "}
                  <strong>{attendingWithoutEmail.length}</strong>{" "}
                  <span className="text-wedding-ink/50">
                    (přeskočeni)
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <ConfirmButton
                action={sendReminderNowAction}
                message={`Opravdu odeslat připomínkový email všem ${attendingWithEmail.length} hostům? Tato akce je nevratná a odešle skutečné maily.`}
                label={`⚠ Odeslat teď všem (${attendingWithEmail.length})`}
                variant="danger"
              />
            </div>

            {lastResult && (
              <div className="mt-4 rounded-md border border-wedding-ink/10 bg-wedding-cream/50 p-3 text-xs">
                <div className="font-medium">
                  Poslední pokus ({formatCzechDate(lastResult.ranAt)})
                </div>
                <div className="mt-1">
                  Odesláno: <strong>{lastResult.sent}</strong> /{" "}
                  {lastResult.totalAttending} · Přeskočeno:{" "}
                  <strong>{lastResult.skipped}</strong>
                </div>
                {lastResult.perGuest &&
                  lastResult.perGuest.some((g) => !g.ok) && (
                    <details className="mt-2">
                      <summary className="cursor-pointer">
                        Chyby (
                        {
                          lastResult.perGuest.filter((g) => !g.ok).length
                        }
                        )
                      </summary>
                      <ul className="mt-1 list-inside list-disc space-y-0.5">
                        {lastResult.perGuest
                          .filter((g) => !g.ok)
                          .map((g, i) => (
                            <li key={i}>
                              <code>{g.name}</code>: {g.error}
                            </li>
                          ))}
                      </ul>
                    </details>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* ===== Preview name form ===== */}
        <form className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-sm">
          <label className="flex flex-col text-sm">
            <span className="mb-1 font-medium">Testovací jméno hosta</span>
            <input
              type="text"
              name="name"
              defaultValue={name}
              className="rounded border border-wedding-ink/20 px-3 py-1.5 text-sm outline-none focus:border-wedding-sage"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-wedding-sage px-4 py-2 text-sm text-white hover:bg-wedding-sage/90"
          >
            Přerenderovat náhled
          </button>
          <p className="text-xs text-wedding-ink/50">
            Aktuální jméno: <code>{name}</code>
          </p>
        </form>

        {/* ===== Previews ===== */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {VARIANTS.map((v) => {
            const { subject, html, text } = buildReminderEmail(name, v.key);
            return (
              <div key={v.key ?? "null"} className="space-y-2">
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <h2 className="font-serif text-lg text-wedding-ink">
                    {v.title}
                  </h2>
                  <p className="text-xs text-wedding-ink/60">{v.sub}</p>
                  <p className="mt-2 text-xs">
                    <strong>Předmět:</strong>{" "}
                    <span className="text-wedding-ink/80">{subject}</span>
                  </p>
                </div>
                <iframe
                  srcDoc={html}
                  title={v.title}
                  className="h-[900px] w-full rounded-xl border border-wedding-ink/10 bg-white shadow-sm"
                />
                <details className="rounded-xl bg-white p-4 shadow-sm">
                  <summary className="cursor-pointer text-xs font-medium text-wedding-ink/70">
                    Plain-text verze (pro klienty bez HTML)
                  </summary>
                  <pre className="mt-3 whitespace-pre-wrap text-xs text-wedding-ink/80">
                    {text}
                  </pre>
                </details>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
