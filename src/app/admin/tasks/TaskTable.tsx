"use client";

import { useState } from "react";
import type { TaskRow, TaskStatus } from "@/lib/db";
import {
  addTaskAction,
  cycleTaskStatusAction,
  deleteTaskAction,
  updateTaskAction,
} from "./actions";

const STATUS_LABEL: Record<TaskStatus, string> = {
  new: "Nový",
  in_progress: "Probíhá",
  done: "Hotovo",
};

// Tailwind classes for row + status badge
const ROW_CLASS: Record<TaskStatus, string> = {
  new: "bg-stone-50",
  in_progress: "bg-amber-50",
  done: "bg-emerald-50",
};

const BADGE_CLASS: Record<TaskStatus, string> = {
  new: "bg-stone-200 text-stone-700",
  in_progress: "bg-amber-200 text-amber-900",
  done: "bg-emerald-200 text-emerald-900",
};

const inputCls =
  "w-full rounded-md border border-wedding-ink/20 bg-white px-2 py-1 text-sm outline-none focus:border-wedding-sage focus:ring-1 focus:ring-wedding-sage/30";

const numInputCls = inputCls + " text-right tabular-nums";

function fmtCzk(n: number): string {
  if (n === 0) return "—";
  return new Intl.NumberFormat("cs-CZ").format(n) + " Kč";
}

export default function TaskTable({ tasks }: { tasks: TaskRow[] }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [hideDone, setHideDone] = useState(false);

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const visibleTasks = hideDone
    ? tasks.filter((t) => t.status !== "done")
    : tasks;

  return (
    <div className="space-y-4">
      {/* Add task form */}
      <form
        action={addTaskAction}
        className="grid grid-cols-1 gap-2 rounded-xl border border-wedding-sage/30 bg-white p-4 sm:grid-cols-[1fr_140px_140px_auto]"
      >
        <input
          name="name"
          required
          minLength={2}
          placeholder="Název položky (např. Květinová výzdoba)"
          className={inputCls}
        />
        <input
          name="planned_cost"
          type="number"
          min={0}
          step={1}
          placeholder="Plán Kč"
          className={numInputCls}
        />
        <input
          name="actual_cost"
          type="number"
          min={0}
          step={1}
          placeholder="Zaplaceno Kč"
          className={numInputCls}
        />
        <button
          type="submit"
          className="rounded-md bg-wedding-sage px-4 py-1.5 text-sm font-medium text-white hover:bg-wedding-sage/90"
        >
          Přidat
        </button>
      </form>

      {/* Filter bar */}
      {tasks.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-wedding-ink/80">
            <input
              type="checkbox"
              checked={hideDone}
              onChange={(e) => setHideDone(e.target.checked)}
              className="h-4 w-4 accent-wedding-sage"
            />
            <span>Skrýt hotové položky</span>
            {hideDone && doneCount > 0 && (
              <span className="text-xs text-wedding-ink/50">
                (skryto {doneCount})
              </span>
            )}
          </label>
          <span className="text-xs text-wedding-ink/50">
            Zobrazeno {visibleTasks.length} / {tasks.length}
          </span>
        </div>
      )}

      {/* List */}
      {tasks.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-wedding-ink/60">
          Zatím žádné položky. Přidej první nahoře nebo načti výchozí seznam.
        </p>
      ) : visibleTasks.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-wedding-ink/60">
          Všechny položky jsou hotové. 🎉 Odškrtni filtr, ať je vidíš znovu.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-wedding-ink/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-wedding-sage/10 text-left text-wedding-ink">
              <tr>
                <th className="w-[110px] px-3 py-2">Stav</th>
                <th className="px-3 py-2">Položka</th>
                <th className="w-[110px] px-3 py-2 text-right">Plánováno</th>
                <th className="w-[110px] px-3 py-2 text-right">Zaplaceno</th>
                <th className="w-[140px] px-3 py-2 text-right">Akce</th>
              </tr>
            </thead>
            <tbody>
              {visibleTasks.map((t) =>
                editingId === t.id ? (
                  <tr key={t.id} className={ROW_CLASS[t.status]}>
                    <td colSpan={5} className="px-3 py-2">
                      <form
                        action={async (fd) => {
                          await updateTaskAction(fd);
                          setEditingId(null);
                        }}
                        className="grid grid-cols-1 gap-2 sm:grid-cols-[110px_1fr_120px_120px_auto]"
                      >
                        <input type="hidden" name="id" value={t.id} />
                        <span
                          className={`inline-flex h-[34px] items-center justify-center rounded-full text-xs font-medium ${BADGE_CLASS[t.status]}`}
                        >
                          {STATUS_LABEL[t.status]}
                        </span>
                        <input
                          name="name"
                          defaultValue={t.name}
                          required
                          minLength={2}
                          className={inputCls}
                        />
                        <input
                          name="planned_cost"
                          type="number"
                          min={0}
                          step={1}
                          defaultValue={t.planned_cost || ""}
                          className={numInputCls}
                          placeholder="0"
                        />
                        <input
                          name="actual_cost"
                          type="number"
                          min={0}
                          step={1}
                          defaultValue={t.actual_cost || ""}
                          className={numInputCls}
                          placeholder="0"
                        />
                        <div className="flex gap-1">
                          <button
                            type="submit"
                            className="rounded-md bg-wedding-sage px-3 py-1 text-xs font-medium text-white hover:bg-wedding-sage/90"
                          >
                            Uložit
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-md border border-wedding-ink/20 px-3 py-1 text-xs hover:bg-wedding-ink/5"
                          >
                            Zrušit
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={t.id}
                    className={`${ROW_CLASS[t.status]} border-t border-wedding-ink/5 align-middle`}
                  >
                    <td className="px-3 py-2">
                      <form action={cycleTaskStatusAction}>
                        <input type="hidden" name="id" value={t.id} />
                        <input
                          type="hidden"
                          name="current_status"
                          value={t.status}
                        />
                        <button
                          type="submit"
                          title="Kliknutím změníš stav"
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition hover:opacity-80 ${BADGE_CLASS[t.status]}`}
                        >
                          {STATUS_LABEL[t.status]}
                        </button>
                      </form>
                    </td>
                    <td className="px-3 py-2">{t.name}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-wedding-ink/80">
                      {fmtCzk(t.planned_cost)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-wedding-ink/80">
                      {fmtCzk(t.actual_cost)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingId(t.id)}
                          className="rounded-md border border-wedding-ink/20 px-2 py-0.5 text-xs hover:bg-wedding-ink/5"
                        >
                          Upravit
                        </button>
                        <form
                          action={deleteTaskAction}
                          onSubmit={(e) => {
                            if (
                              !confirm(
                                `Opravdu smazat položku "${t.name}"?`,
                              )
                            ) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <input type="hidden" name="id" value={t.id} />
                          <button
                            type="submit"
                            className="rounded-md border border-red-300 px-2 py-0.5 text-xs text-red-700 hover:bg-red-50"
                          >
                            Smazat
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
