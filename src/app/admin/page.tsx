import { redirect } from "next/navigation";
import {
  listRsvp,
  DRINK_OPTIONS,
  drinkLabel,
  accommodationStayLabel,
} from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { logoutAction } from "./login/actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const rows = await listRsvp();

  const attending = rows.filter((r) => r.attending === 1);
  const notAttending = rows.filter((r) => r.attending === 0);
  const totalAdults = attending.reduce((sum, r) => sum + r.adults_count, 0);
  const totalChildren = attending.reduce((sum, r) => sum + r.children_count, 0);
  const totalPeople = totalAdults + totalChildren;
  const accommodation = attending.filter((r) => r.accommodation_needed === 1).length;
  const withDiet = attending.filter((r) => r.dietary_notes).length;
  const stayWeekend = attending.filter((r) => r.accommodation_stay === "weekend").length;
  const staySatSun = attending.filter((r) => r.accommodation_stay === "sat_sun").length;
  const stayOneDay = attending.filter((r) => r.accommodation_stay === "one_day").length;

  // Drink stats — count across attending guests (multi-select).
  const drinkCounts: Record<string, number> = {};
  for (const d of DRINK_OPTIONS) drinkCounts[d.value] = 0;
  for (const r of attending) {
    if (!r.drinks) continue;
    for (const v of r.drinks.split(",")) {
      if (v in drinkCounts) drinkCounts[v]++;
    }
  }

  return (
    <main className="min-h-screen bg-wedding-cream">
      <header className="border-b border-wedding-ink/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="font-serif text-2xl">Admin — RSVP přehled</h1>
          <div className="flex items-center gap-3">
            <a
              href="/api/export"
              className="rounded-md bg-wedding-sage px-4 py-2 text-sm text-white hover:bg-wedding-sage/90"
            >
              Export CSV
            </a>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm text-wedding-ink/70 hover:underline"
              >
                Odhlásit
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Odpovědí celkem" value={rows.length} />
          <Stat
            label="Přijde osob (dospělí + děti)"
            value={`${totalPeople} (${totalAdults}+${totalChildren})`}
            accent
          />
          <Stat label="Omluveno" value={notAttending.length} />
          <Stat label="Chce ubytování" value={accommodation} />
        </div>
        <div className="mt-2 text-sm text-wedding-ink/60">
          Dietní požadavky: {withDiet} &middot; Potvrzených odpovědí: {attending.length}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-wedding-ink/60">
              Preference nápojů
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {DRINK_OPTIONS.map((d) => (
                <span
                  key={d.value}
                  className="rounded-full bg-wedding-sage/10 px-3 py-1 text-sm"
                >
                  {d.label}: <strong>{drinkCounts[d.value]}</strong>
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-wedding-ink/60">
              Ubytování
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-wedding-sage/10 px-3 py-1">
                Pá–ne: <strong>{stayWeekend}</strong>
              </span>
              <span className="rounded-full bg-wedding-sage/10 px-3 py-1">
                So–ne: <strong>{staySatSun}</strong>
              </span>
              <span className="rounded-full bg-wedding-rose/10 px-3 py-1">
                Jen 1 den: <strong>{stayOneDay}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-wedding-sage/10 text-left text-wedding-ink">
              <tr>
                <Th>Datum</Th>
                <Th>Jméno</Th>
                <Th>Stav</Th>
                <Th>Dospělí</Th>
                <Th>Děti</Th>
                <Th>Doprovod</Th>
                <Th>Dieta</Th>
                <Th>Nápoje</Th>
                <Th>Ubytování</Th>
                <Th>Kontakt</Th>
                <Th>Vzkaz</Th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-wedding-ink/60">
                    Zatím žádné odpovědi.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-wedding-ink/5 align-top">
                  <Td>{new Date(r.created_at + "Z").toLocaleString("cs-CZ")}</Td>
                  <Td className="font-medium">{r.name}</Td>
                  <Td>
                    {r.attending ? (
                      <span className="rounded-full bg-wedding-sage/20 px-2 py-0.5 text-xs text-wedding-sage">
                        Přijde
                      </span>
                    ) : (
                      <span className="rounded-full bg-wedding-rose/20 px-2 py-0.5 text-xs text-wedding-rose">
                        Nepřijde
                      </span>
                    )}
                  </Td>
                  <Td>{r.attending ? r.adults_count : "—"}</Td>
                  <Td>{r.attending ? r.children_count : "—"}</Td>
                  <Td>{r.companion_name || "—"}</Td>
                  <Td className="max-w-[200px] whitespace-pre-wrap">
                    {r.dietary_notes || "—"}
                  </Td>
                  <Td className="max-w-[180px]">
                    {r.drinks
                      ? r.drinks
                          .split(",")
                          .map((v) => drinkLabel(v))
                          .join(", ")
                      : "—"}
                  </Td>
                  <Td className="max-w-[180px] text-xs">
                    {accommodationStayLabel(r.accommodation_stay)}
                  </Td>
                  <Td className="text-xs">
                    {r.email && <div>{r.email}</div>}
                    {r.phone && <div>{r.phone}</div>}
                    {!r.email && !r.phone && "—"}
                  </Td>
                  <Td className="max-w-[260px] whitespace-pre-wrap text-wedding-ink/80">
                    {r.message || "—"}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl p-4 shadow-sm ${
        accent ? "bg-wedding-sage text-white" : "bg-white text-wedding-ink"
      }`}
    >
      <div className="text-xs uppercase tracking-wide opacity-80">{label}</div>
      <div className="mt-1 text-3xl font-semibold">{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 font-medium">{children}</th>;
}
function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
