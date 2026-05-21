import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { listScheduleItems, type ScheduleItemRow } from "@/lib/db";
import { logoutAction } from "../login/actions";
import AdminNav from "../AdminNav";
import ScheduleTable from "./ScheduleTable";
import { seedScheduleAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const items: ScheduleItemRow[] = await listScheduleItems();

  return (
    <main className="min-h-screen bg-wedding-cream">
      <header className="border-b border-wedding-ink/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="font-serif text-2xl">Admin</h1>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-wedding-ink/70 hover:underline"
            >
              Odhlásit
            </button>
          </form>
        </div>
      </header>
      <AdminNav />

      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-3xl">Harmonogram svatebního dne</h2>
          <div className="text-sm text-wedding-ink/60">
            {items.length} položek
          </div>
        </div>

        {items.length === 0 && (
          <div className="mb-6 rounded-xl border border-dashed border-wedding-sage/40 bg-white p-6 text-center">
            <p className="text-wedding-ink/70">
              Harmonogram je prázdný. Můžeš si načíst výchozí rozvrh ze
              svatebního plánu.
            </p>
            <form action={seedScheduleAction} className="mt-4">
              <button
                type="submit"
                className="rounded-md bg-wedding-sage px-5 py-2 text-sm font-medium text-white hover:bg-wedding-sage/90"
              >
                Načíst výchozí rozvrh
              </button>
            </form>
          </div>
        )}

        <ScheduleTable items={items} />
      </section>
    </main>
  );
}
