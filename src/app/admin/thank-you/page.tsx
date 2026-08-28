import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import {
  buildThankYouEmail,
  VARIANT_META,
  type ThankYouVariant,
} from "@/lib/thankYouTemplate";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { listRsvp } from "@/lib/db";
import { sendThankYouNowAction } from "./actions";
import RecipientSelector, {
  type SelectorGuest,
} from "../RecipientSelector";

export const dynamic = "force-dynamic";

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

function parseVariant(v: string | undefined): ThankYouVariant {
  return v === "photos" ? "photos" : "thanks";
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const params = await searchParams;
  const variant = parseVariant(params.variant);

  // Klíče pro aktuální variantu
  const lastSentKey =
    variant === "photos"
      ? SETTING_KEYS.photosLastSentAt
      : SETTING_KEYS.thankYouLastSentAt;
  const lastResultKey =
    variant === "photos"
      ? SETTING_KEYS.photosLastResult
      : SETTING_KEYS.thankYouLastResult;

  const [lastSentAt, lastResultJson, guests] = await Promise.all([
    getSetting(lastSentKey),
    getSetting(lastResultKey),
    listRsvp(),
  ]);

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

  const { subject, html, text } = buildThankYouEmail(variant);
  const meta = VARIANT_META[variant];

  // Server action s předvyplněnou variantou
  const boundAction = sendThankYouNowAction.bind(null, variant);

  return (
    <main className="min-h-screen bg-wedding-cream">
      <header className="border-b border-wedding-ink/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="font-serif text-2xl">
              Děkovný email — nastavení a náhled
            </h1>
            <p className="mt-1 text-xs text-wedding-ink/60">
              Jednotný text pro všechny hosty. Bez plánování — jen ruční
              odeslání.
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

      <section className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {/* ===== Variant tabs ===== */}
        <div className="flex gap-1 border-b border-wedding-ink/15">
          <VariantTab
            href="/admin/thank-you"
            label={VARIANT_META.thanks.title}
            active={variant === "thanks"}
          />
          <VariantTab
            href="/admin/thank-you?variant=photos"
            label={VARIANT_META.photos.title}
            active={variant === "photos"}
          />
        </div>

        <p className="text-xs text-wedding-ink/70">{meta.description}</p>

        {/* ===== Manual send ===== */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="font-serif text-lg text-wedding-ink">
            Ruční odeslání ({meta.title})
          </h2>
          <p className="mt-1 text-xs text-wedding-ink/60">
            Odešle vybranou šablonu všem nebo jen vybraným hostům. Vyžaduje
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
                <span className="text-wedding-ink/50">(přeskočeni)</span>
              </div>
            )}
            <div className="text-xs text-wedding-ink/60">
              Poslední odeslání této šablony:{" "}
              <strong>{formatCzechDate(lastSentAt)}</strong>
            </div>
          </div>

          <div className="mt-4">
            <RecipientSelector
              guests={attendingWithEmail.map<SelectorGuest>((g) => ({
                id: g.id,
                name: g.name,
                email: g.email as string,
                stay: g.accommodation_stay,
              }))}
              action={boundAction}
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
                      {lastResult.perGuest.filter((g) => !g.ok).length})
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

        {/* ===== Preview ===== */}
        <div className="space-y-2">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="font-serif text-lg text-wedding-ink">
              Náhled zprávy ({meta.title})
            </h2>
            <p className="mt-2 text-xs">
              <strong>Předmět:</strong>{" "}
              <span className="text-wedding-ink/80">{subject}</span>
            </p>
            <p className="mt-1 text-xs text-wedding-ink/60">
              Tento text dostanou <strong>všichni</strong> vybraní hosté beze
              změny — bez oslovování jménem.
            </p>
          </div>
          <iframe
            srcDoc={html}
            title={`Náhled — ${meta.title}`}
            className="h-[820px] w-full rounded-xl border border-wedding-ink/10 bg-white shadow-sm"
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
      </section>
    </main>
  );
}

function VariantTab({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  const base =
    "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition inline-flex items-center gap-2";
  const activeCls = active
    ? "border-wedding-sage text-wedding-ink"
    : "border-transparent text-wedding-ink/50 hover:text-wedding-ink";
  return (
    <Link href={href} className={`${base} ${activeCls}`}>
      {label}
    </Link>
  );
}
