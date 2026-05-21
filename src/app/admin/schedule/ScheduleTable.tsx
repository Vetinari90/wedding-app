"use client";

import { useState } from "react";
import type { ScheduleItemRow } from "@/lib/db";
import {
  addScheduleItemAction,
  deleteScheduleItemAction,
  updateScheduleItemAction,
} from "./actions";

const inputCls =
  "w-full rounded-md border border-wedding-ink/20 bg-white px-2 py-1 text-sm outline-none focus:border-wedding-sage focus:ring-1 focus:ring-wedding-sage/30";

export default function ScheduleTable({
  items,
}: {
  items: ScheduleItemRow[];
}) {
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {/* Add form */}
      <form
        action={addScheduleItemAction}
        className="grid grid-cols-1 gap-2 rounded-xl border border-wedding-sage/30 bg-white p-4 sm:grid-cols-[180px_1fr_auto]"
      >
        <input
          name="time"
          required
          placeholder="Čas (např. 15:30 – 17:00)"
          className={inputCls}
        />
        <input
          name="activity"
          required
          placeholder="Aktivita"
          className={inputCls}
        />
        <button
          type="submit"
          className="rounded-md bg-wedding-sage px-4 py-1.5 text-sm font-medium text-white hover:bg-wedding-sage/90"
        >
          Přidat
        </button>
      </form>

      {items.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-wedding-ink/60">
          Harmonogram je prázdný. Přidej první položku nebo načti výchozí
          rozvrh.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-wedding-ink/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-wedding-sage/10 text-left text-wedding-ink">
              <tr>
                <th className="w-[180px] px-3 py-2">Čas</th>
                <th className="px-3 py-2">Aktivita</th>
                <th className="w-[120px] px-3 py-2 text-right">Akce</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) =>
                editingId === item.id ? (
                  <tr key={item.id} className="border-t border-wedding-ink/5">
                    <td colSpan={3} className="px-3 py-2">
                      <form
                        action={async (fd) => {
                          await updateScheduleItemAction(fd);
                          setEditingId(null);
                        }}
                        className="grid grid-cols-1 gap-2 sm:grid-cols-[180px_1fr_auto]"
                      >
                        <input type="hidden" name="id" value={item.id} />
                        <input
                          name="time"
                          defaultValue={item.time}
                          required
                          className={inputCls}
                        />
                        <input
                          name="activity"
                          defaultValue={item.activity}
                          required
                          className={inputCls}
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
                    key={item.id}
                    className="border-t border-wedding-ink/5 align-top"
                  >
                    <td className="px-3 py-2 font-medium tabular-nums text-wedding-ink">
                      {item.time}
                    </td>
                    <td className="px-3 py-2 text-wedding-ink/90">
                      {item.activity}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingId(item.id)}
                          className="rounded-md border border-wedding-ink/20 px-2 py-0.5 text-xs hover:bg-wedding-ink/5"
                        >
                          Upravit
                        </button>
                        <form
                          action={deleteScheduleItemAction}
                          onSubmit={(e) => {
                            if (!confirm("Opravdu smazat položku?")) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <input type="hidden" name="id" value={item.id} />
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
