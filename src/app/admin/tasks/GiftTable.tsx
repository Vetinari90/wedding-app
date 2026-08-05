"use client";

import { useState } from "react";
import type { GiftRow } from "@/lib/db";
import {
  addGiftAction,
  deleteGiftAction,
  updateGiftAction,
} from "./giftActions";

const inputCls =
  "w-full rounded-md border border-wedding-ink/20 bg-white px-2 py-1 text-sm outline-none focus:border-wedding-sage focus:ring-1 focus:ring-wedding-sage/30";

const numInputCls = inputCls + " text-right tabular-nums";

function fmtCzk(n: number): string {
  if (n === 0) return "—";
  return new Intl.NumberFormat("cs-CZ").format(n) + " Kč";
}

export default function GiftTable({ gifts }: { gifts: GiftRow[] }) {
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {/* Add gift form */}
      <form
        action={addGiftAction}
        className="grid grid-cols-1 gap-2 rounded-xl border border-wedding-rose/40 bg-white p-4 sm:grid-cols-[1.4fr_140px_1.4fr_auto]"
      >
        <input
          name="donor_name"
          required
          minLength={1}
          placeholder="Kdo dal dar (jméno)"
          className={inputCls}
        />
        <input
          name="amount"
          type="number"
          min={0}
          step={1}
          placeholder="Částka Kč"
          className={numInputCls}
        />
        <input
          name="note"
          placeholder="Poznámka (volitelné)"
          className={inputCls}
        />
        <button
          type="submit"
          className="rounded-md bg-wedding-rose px-4 py-1.5 text-sm font-medium text-white hover:bg-wedding-rose/90"
        >
          Přidat dar
        </button>
      </form>

      {/* List */}
      {gifts.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-wedding-ink/60">
          Zatím žádné dary. Přidej první přes formulář výše.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-wedding-rose/10 text-left text-wedding-ink">
              <tr>
                <th className="px-3 py-2 font-medium">Datum</th>
                <th className="px-3 py-2 font-medium">Dárce</th>
                <th className="px-3 py-2 text-right font-medium">Částka</th>
                <th className="px-3 py-2 font-medium">Poznámka</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {gifts.map((g) => {
                const isEditing = editingId === g.id;
                return (
                  <tr
                    key={g.id}
                    className="border-t border-wedding-ink/5 align-top hover:bg-wedding-rose/5"
                  >
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-wedding-ink/60">
                      {new Date(g.created_at + "Z").toLocaleDateString(
                        "cs-CZ",
                      )}
                    </td>
                    {isEditing ? (
                      <>
                        <td className="px-3 py-2" colSpan={3}>
                          <form
                            action={async (fd) => {
                              await updateGiftAction(fd);
                              setEditingId(null);
                            }}
                            className="grid grid-cols-[1.4fr_130px_1.4fr_auto] gap-2"
                          >
                            <input type="hidden" name="id" value={g.id} />
                            <input
                              name="donor_name"
                              required
                              defaultValue={g.donor_name}
                              className={inputCls}
                            />
                            <input
                              name="amount"
                              type="number"
                              min={0}
                              defaultValue={g.amount || ""}
                              className={numInputCls}
                            />
                            <input
                              name="note"
                              defaultValue={g.note ?? ""}
                              className={inputCls}
                            />
                            <div className="flex gap-1">
                              <button
                                type="submit"
                                className="rounded bg-wedding-sage px-2 py-1 text-xs text-white hover:bg-wedding-sage/90"
                              >
                                Uložit
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="rounded bg-stone-200 px-2 py-1 text-xs text-stone-700 hover:bg-stone-300"
                              >
                                Zrušit
                              </button>
                            </div>
                          </form>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-2 font-medium">
                          {g.donor_name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums font-medium text-wedding-rose">
                          {fmtCzk(g.amount)}
                        </td>
                        <td className="px-3 py-2 text-wedding-ink/70">
                          {g.note ?? "—"}
                        </td>
                      </>
                    )}
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      {!isEditing && (
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingId(g.id)}
                            className="rounded border border-wedding-ink/20 px-2 py-1 text-xs text-wedding-ink/70 hover:bg-wedding-cream"
                          >
                            Upravit
                          </button>
                          <form
                            action={deleteGiftAction}
                            onSubmit={(e) => {
                              if (
                                !confirm(
                                  `Smazat dar od ${g.donor_name}?`,
                                )
                              )
                                e.preventDefault();
                            }}
                          >
                            <input type="hidden" name="id" value={g.id} />
                            <button
                              type="submit"
                              className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                            >
                              Smazat
                            </button>
                          </form>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
