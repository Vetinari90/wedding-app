import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { buildReminderEmail, type ReminderStay } from "@/lib/reminderTemplate";

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

export default async function PreviewReminderPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const params = await searchParams;
  const name = (params.name?.trim() || "Anna Nováková").slice(0, 100);

  return (
    <main className="min-h-screen bg-wedding-cream">
      <header className="border-b border-wedding-ink/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="font-serif text-2xl">
              Náhled — připomínkové emaily
            </h1>
            <p className="mt-1 text-xs text-wedding-ink/60">
              Šablony pro hromadnou připomínku 2 týdny před svatbou. Zatím{" "}
              <strong>bez</strong> plánování odesílání — jen náhled.
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

      <section className="mx-auto max-w-7xl px-4 py-8">
        <form className="mb-6 flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-sm">
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
            Přerenderovat
          </button>
          <p className="text-xs text-wedding-ink/50">
            Aktuální jméno: <code>{name}</code>
          </p>
        </form>

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

        <p className="mt-8 text-xs text-wedding-ink/50">
          Až budou šablony finální, přidáme mechanismus odeslání (jednorázová
          akce z adminu nebo naplánovaný cron 14 dní před svatbou).
        </p>
      </section>
    </main>
  );
}
