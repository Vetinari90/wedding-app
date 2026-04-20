"use client";

import { useActionState, useState } from "react";
import { submitRsvp, type FormState } from "./actions";

const initial: FormState = { ok: false };

export default function RsvpForm() {
  const [state, formAction, pending] = useActionState(submitRsvp, initial);
  const [attending, setAttending] = useState<"yes" | "no">(
    (state.values?.attending as "yes" | "no") ?? "yes",
  );

  const err = (k: string) => state.errors?.[k];
  const val = (k: string) => state.values?.[k] ?? "";

  return (
    <form action={formAction} className="space-y-6">
      <Field label="Jméno a příjmení *" error={err("name")}>
        <input
          name="name"
          defaultValue={val("name")}
          required
          className={inputCls}
          placeholder="Jan Novák"
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-6">
        <Field label="Email" error={err("email")}>
          <input
            name="email"
            type="email"
            defaultValue={val("email")}
            className={inputCls}
            placeholder="jan@priklad.cz"
          />
        </Field>
        <Field label="Telefon" error={err("phone")}>
          <input
            name="phone"
            defaultValue={val("phone")}
            className={inputCls}
            placeholder="+420 ..."
          />
        </Field>
      </div>

      <fieldset className="space-y-3">
        <legend className="font-medium">Dorazíte? *</legend>
        <div className="flex gap-3">
          <RadioCard
            name="attending"
            value="yes"
            checked={attending === "yes"}
            onChange={() => setAttending("yes")}
            label="Ano, přijdu"
          />
          <RadioCard
            name="attending"
            value="no"
            checked={attending === "no"}
            onChange={() => setAttending("no")}
            label="Bohužel nemohu"
          />
        </div>
      </fieldset>

      {attending === "yes" && (
        <div className="space-y-6 rounded-lg border border-wedding-sage/30 bg-white/60 p-5">
          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="Počet dospělých" error={err("adults_count")}>
              <input
                name="adults_count"
                type="number"
                min={1}
                max={10}
                defaultValue={val("adults_count") || "1"}
                className={inputCls}
              />
            </Field>
            <Field label="Počet dětí" error={err("children_count")}>
              <input
                name="children_count"
                type="number"
                min={0}
                max={10}
                defaultValue={val("children_count") || "0"}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Jméno doprovodu (pokud je)" error={err("companion_name")}>
            <input
              name="companion_name"
              defaultValue={val("companion_name")}
              className={inputCls}
              placeholder="Jana Nováková"
            />
          </Field>

          <Field
            label="Dietní preference / alergie"
            error={err("dietary_notes")}
            hint="Vegetariánské, veganské, bezlepkové, alergie..."
          >
            <textarea
              name="dietary_notes"
              rows={2}
              defaultValue={val("dietary_notes")}
              className={inputCls}
            />
          </Field>

          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="accommodation_needed"
                defaultChecked={val("accommodation_needed") === "on"}
                className="h-4 w-4 accent-wedding-sage"
              />
              <span>Potřebuji zajistit ubytování</span>
            </label>
          </div>

          <Field label="Doprava (poznámka)" error={err("transport_notes")}>
            <input
              name="transport_notes"
              defaultValue={val("transport_notes")}
              className={inputCls}
              placeholder="Přivezu se autem / potřebuji odvoz..."
            />
          </Field>
        </div>
      )}

      <Field label="Vzkaz pro novomanžele" error={err("message")}>
        <textarea
          name="message"
          rows={3}
          defaultValue={val("message")}
          className={inputCls}
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-wedding-sage px-6 py-3 text-white font-medium hover:bg-wedding-sage/90 transition disabled:opacity-50"
      >
        {pending ? "Odesílám..." : "Odeslat potvrzení"}
      </button>
    </form>
  );
}

const inputCls =
  "w-full rounded-md border border-wedding-ink/20 bg-white px-3 py-2 text-wedding-ink outline-none focus:border-wedding-sage focus:ring-2 focus:ring-wedding-sage/30";

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && !error && <span className="text-xs text-wedding-ink/60">{hint}</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}

function RadioCard({
  name,
  value,
  checked,
  onChange,
  label,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label
      className={`flex-1 cursor-pointer rounded-md border px-4 py-3 text-center transition ${
        checked
          ? "border-wedding-sage bg-wedding-sage/10 text-wedding-ink"
          : "border-wedding-ink/20 bg-white hover:border-wedding-sage/60"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {label}
    </label>
  );
}
