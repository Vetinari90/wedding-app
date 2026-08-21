"use client";

import { useMemo, useState } from "react";

export type SelectorGuest = {
  id: number;
  name: string;
  email: string;
  stay: string | null;
};

const STAY_LABEL: Record<string, string> = {
  weekend: "Pá–Ne",
  sat_sun: "So–Ne",
  one_day: "Jen sobota",
};

function stayLabel(s: string | null): string {
  if (!s) return "—";
  return STAY_LABEL[s] ?? s;
}

const STAY_BADGE: Record<string, string> = {
  weekend: "bg-emerald-100 text-emerald-800",
  sat_sun: "bg-amber-100 text-amber-800",
  one_day: "bg-stone-200 text-stone-700",
};

export default function RecipientSelector({
  guests,
  action,
}: {
  guests: SelectorGuest[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [mode, setMode] = useState<"all" | "selected">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");

  const filteredGuests = useMemo(() => {
    if (!filter.trim()) return guests;
    const f = filter.trim().toLowerCase();
    return guests.filter(
      (g) =>
        g.name.toLowerCase().includes(f) ||
        g.email.toLowerCase().includes(f),
    );
  }, [guests, filter]);

  const targetCount = mode === "all" ? guests.length : selected.size;
  const disabled = mode === "selected" && selected.size === 0;

  function toggle(email: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  }

  function selectAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const g of filteredGuests) next.add(g.email);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  return (
    <form
      action={action}
      onSubmit={(e) => {
        const label =
          mode === "all"
            ? `všem ${targetCount} hostům`
            : `${targetCount} vybraným hostům`;
        if (
          !confirm(
            `Opravdu odeslat připomínkový email ${label}? Tato akce je nevratná a odešle skutečné maily.`,
          )
        ) {
          e.preventDefault();
        }
      }}
      className="space-y-3"
    >
      {/* Mode toggle */}
      <input type="hidden" name="mode" value={mode} />
      <div className="flex gap-2">
        <ModeButton
          active={mode === "all"}
          onClick={() => setMode("all")}
          label={`Všem (${guests.length})`}
        />
        <ModeButton
          active={mode === "selected"}
          onClick={() => setMode("selected")}
          label={`Vybraným (${selected.size})`}
        />
      </div>

      {/* Recipient picker */}
      {mode === "selected" && (
        <div className="rounded-md border border-wedding-ink/15 bg-wedding-cream/40 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Hledat jméno nebo email..."
              className="flex-1 rounded border border-wedding-ink/20 bg-white px-2 py-1"
            />
            <button
              type="button"
              onClick={selectAllVisible}
              className="rounded border border-wedding-ink/20 bg-white px-2 py-1 hover:bg-wedding-sage/10"
            >
              Vybrat vše
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="rounded border border-wedding-ink/20 bg-white px-2 py-1 hover:bg-wedding-sage/10"
            >
              Zrušit výběr
            </button>
          </div>

          {filteredGuests.length === 0 ? (
            <p className="p-3 text-center text-xs text-wedding-ink/60">
              {filter ? "Nic nenalezeno" : "Žádní hosté"}
            </p>
          ) : (
            <ul className="max-h-72 space-y-0.5 overflow-y-auto text-sm">
              {filteredGuests.map((g) => {
                const isChecked = selected.has(g.email);
                return (
                  <li key={g.id}>
                    <label
                      className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 transition ${
                        isChecked
                          ? "bg-wedding-sage/15"
                          : "hover:bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="emails"
                        value={g.email}
                        checked={isChecked}
                        onChange={() => toggle(g.email)}
                        className="h-4 w-4 accent-wedding-sage"
                      />
                      <span className="font-medium text-wedding-ink">
                        {g.name}
                      </span>
                      <span className="text-xs text-wedding-ink/60">
                        {g.email}
                      </span>
                      <span
                        className={`ml-auto rounded-full px-2 py-0.5 text-[10px] ${
                          STAY_BADGE[g.stay ?? ""] ??
                          "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {stayLabel(g.stay)}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={disabled}
          className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
            disabled
              ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400"
              : "border-red-400 bg-red-50 text-red-800 hover:bg-red-100"
          }`}
        >
          ⚠ Odeslat teď{mode === "all" ? " všem" : ""} ({targetCount})
        </button>
        {disabled && (
          <span className="ml-3 text-xs text-wedding-ink/60">
            Vyber alespoň jednoho příjemce.
          </span>
        )}
      </div>
    </form>
  );
}

function ModeButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md border px-3 py-1.5 text-sm transition ${
        active
          ? "border-wedding-sage bg-wedding-sage text-white"
          : "border-wedding-ink/20 bg-white text-wedding-ink hover:border-wedding-sage/60"
      }`}
    >
      {label}
    </button>
  );
}
