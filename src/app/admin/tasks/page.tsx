import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { listTasks, type TaskRow } from "@/lib/db";
import { logoutAction } from "../login/actions";
import AdminNav from "../AdminNav";
import TaskTable from "./TaskTable";
import { seedTasksAction, deleteAllTasksAction } from "./actions";
import DangerWipe from "../DangerWipe";

export const dynamic = "force-dynamic";

function fmtCzk(n: number): string {
  return new Intl.NumberFormat("cs-CZ").format(n) + " Kč";
}

export default async function TasksPage() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const tasks: TaskRow[] = await listTasks();

  const totalPlanned = tasks.reduce((s, t) => s + (t.planned_cost || 0), 0);
  const totalActual = tasks.reduce((s, t) => s + (t.actual_cost || 0), 0);
  const remaining = totalPlanned - totalActual;

  const counts = {
    new: tasks.filter((t) => t.status === "new").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

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

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-3xl">Co zařídit</h2>
          <div className="text-sm text-wedding-ink/60">
            Stav: {counts.new} nových · {counts.in_progress} probíhá ·{" "}
            {counts.done} hotovo
          </div>
        </div>

        {/* Budget summary */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-wedding-ink/60">
              Celkem plánováno
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {fmtCzk(totalPlanned)}
            </div>
          </div>
          <div className="rounded-xl bg-wedding-sage p-4 text-white shadow-sm">
            <div className="text-xs uppercase tracking-wide opacity-80">
              Již zaplaceno
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {fmtCzk(totalActual)}
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-wedding-ink/60">
              Zbývá doplatit
            </div>
            <div
              className={`mt-1 text-2xl font-semibold tabular-nums ${
                remaining < 0 ? "text-red-600" : "text-wedding-ink"
              }`}
            >
              {fmtCzk(remaining)}
            </div>
          </div>
        </div>

        {/* Empty-state seed button */}
        {tasks.length === 0 && (
          <div className="mb-6 rounded-xl border border-dashed border-wedding-sage/40 bg-white p-6 text-center">
            <p className="text-wedding-ink/70">
              Seznam je prázdný. Můžeš si načíst výchozí položky ze svatebního
              plánu.
            </p>
            <form action={seedTasksAction} className="mt-4">
              <button
                type="submit"
                className="rounded-md bg-wedding-sage px-5 py-2 text-sm font-medium text-white hover:bg-wedding-sage/90"
              >
                Načíst výchozí seznam
              </button>
            </form>
          </div>
        )}

        <TaskTable tasks={tasks} />

        {tasks.length > 0 && (
          <div className="mt-10 flex justify-end">
            <DangerWipe
              count={tasks.length}
              action={deleteAllTasksAction}
              label="Vymazat všechny položky"
            />
          </div>
        )}
      </section>
    </main>
  );
}
