"use client";

import { useActionState, useState } from "react";
import { submitRsvp, checkDuplicate, type FormState } from "./actions";
import { DRINK_OPTIONS } from "@/lib/drinks";

const initial: FormState = { ok: false };

type FieldName = "name" | "companion_name";

type AccChoice = "" | "need" | "none";
type AccStay = "" | "weekend" | "sat_sun";

export default function RsvpForm() {
  const [state, formAction, pending] = useActionState(submitRsvp, initial);
  const [attending, setAttending] = useState<"yes" | "no">(
    (state.values?.attending as "yes" | "no") ?? "yes",
  );
  const [accChoice, setAccChoice] = useState<AccChoice>(
    (state.values?.accommodation_choice as AccChoice) ?? "",
  );
  const [accStay, setAccStay] = useState<AccStay>(
    (state.values?.accommodation_stay as AccStay) ?? "",
  );
  const [conflicts, setConflicts] = useState<{
    name?: string;
    companion_name?: string;
  }>({});
  const [checking, setChecking] = useState<{
    name?: boolean;
    companion_name?: boolean;
  }>({});

  const serverErr = (k: string) => state.errors?.[k];
  const val = (k: string) => state.values?.[k] ?? "";

  async function handleBlur(field: FieldName, value: string) {
    const v = value.trim();
    if (v.length < 2) {
      setConflicts((c) => ({ ...c, [field]: undefined }));
      return;
    }
    setChecking((c) => ({ ...c, [field]: true }));
    try {
      const res = await checkDuplicate(field, v);
      setConflicts((c) => ({
        ...c,
        [field]: res.conflict ? (res.message ?? "Duplikát.") : undefined,
      }));
    } catch {
      setConflicts((c) => ({ ...c, [field]: undefined }));
    } finally {
      setChecking((c) => ({ ...c, [field]: false }));
    }
  }

  function clearConflict(field: FieldName) {
    setConflicts((c) =>
      c[field] === undefined ? c : { ...c, [field]: undefined },
    );
  }

  const hasConflict = Boolean(conflicts.name || conflicts.companion_name);
  const isChecking = Boolean(checking.name || checking.companion_name);
  const missingChoice = attending === "yes" && accChoice === "";
  const missingStay =
    attending === "yes" && accChoice === "need" && accStay === "";
  const submitDisabled =
    pending || hasConflict || isChecking || missingChoice || missingStay;

  // Klient-side konflikt má přednost před server-side chybou ze stejného pole.
  const errName = conflicts.name ?? serverErr("name");
  const errCompanion = conflicts.companion_name ?? serverErr("companion_name");

  return (
    <form action={formAction} className="space-y-6">
      <Field label="Jméno a příjmení *" error={errName}>
        <input
          name="name"
          defaultValue={val("name")}
          required
          className={inputCls}
          placeholder="Jan Novák"
          onChange={() => clearConflict("name")}
          onBlur={(e) => handleBlur("name", e.target.value)}
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-6">
        <Field
          label="Email *"
          error={serverErr("email")}
          hint="Pošleme vám potvrzení s detaily"
        >
          <input
            name="email"
            type="email"
            required
            defaultValue={val("email")}
            className={inputCls}
            placeholder="jan@priklad.cz"
          />
        </Field>
        <Field label="Telefon" error={serverErr("phone")}>
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
            onChange={() => {
              setAttending("no");
              // zrušit případný konflikt doprovodu, pokud host nepřijde
              clearConflict("companion_name");
            }}
            label="Bohužel nemohu"
          />
        </div>
      </fieldset>

      {attending === "yes" && (
        <div className="space-y-6 rounded-lg border border-wedding-sage/30 bg-white/60 p-5">
          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="Počet dospělých" error={serverErr("adults_count")}>
              <input
                name="adults_count"
                type="number"
                min={1}
                max={10}
                defaultValue={val("adults_count") || "1"}
                className={inputCls}
              />
            </Field>
            <Field label="Počet dětí" error={serverErr("children_count")}>
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

          <Field label="Jméno doprovodu (pokud je)" error={errCompanion}>
            <input
              name="companion_name"
              defaultValue={val("companion_name")}
              className={inputCls}
              placeholder="Jana Nováková"
              onChange={() => clearConflict("companion_name")}
              onBlur={(e) => handleBlur("companion_name", e.target.value)}
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-6">
            <Field
              label="Dietní preference / alergie"
              error={serverErr("dietary_notes")}
              hint="Vegetariánské, veganské, bezlepkové, alergie..."
            >
              <textarea
                name="dietary_notes"
                rows={4}
                defaultValue={val("dietary_notes")}
                className={inputCls}
              />
            </Field>

            <div className="block space-y-2">
              <span className="text-sm font-medium">Co budu pít</span>
              <div className="grid grid-cols-1 gap-2">
                {DRINK_OPTIONS.map((d) => (
                  <label
                    key={d.value}
                    className="flex items-center gap-3 cursor-pointer rounded-md border border-wedding-ink/15 bg-white px-3 py-2 hover:border-wedding-sage/60 transition"
                  >
                    <input
                      type="checkbox"
                      name="drinks"
                      value={d.value}
                      className="h-4 w-4 accent-wedding-sage"
                    />
                    <span>{d.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-sm font-medium">Ubytování *</span>
            <div className="grid sm:grid-cols-2 gap-3">
              <ChoiceCard
                label="Potřebuji zajistit ubytování"
                checked={accChoice === "need"}
                onToggle={() => {
                  setAccChoice((c) => (c === "need" ? "" : "need"));
                  if (accChoice === "need") setAccStay("");
                }}
              />
              <ChoiceCard
                label="Nepotřebuju ubytování, budu jen jeden den"
                checked={accChoice === "none"}
                onToggle={() => {
                  setAccChoice((c) => (c === "none" ? "" : "none"));
                  setAccStay("");
                }}
              />
            </div>
            {serverErr("accommodation_choice") && !missingChoice && (
              <span className="text-xs text-red-600">
                {serverErr("accommodation_choice")}
              </span>
            )}
            {/* Hidden input, aby se choice poslalo na server */}
            <input
              type="hidden"
              name="accommodation_choice"
              value={accChoice}
            />

            {accChoice === "need" && (
              <div className="rounded-md border border-wedding-sage/30 bg-white p-4 space-y-2">
                <span className="text-sm font-medium">Délka pobytu *</span>
                <div className="space-y-2">
                  <StayOption
                    value="weekend"
                    checked={accStay === "weekend"}
                    onSelect={() => setAccStay("weekend")}
                    label="Zůstanu celý víkend (pá–ne)"
                  />
                  <StayOption
                    value="sat_sun"
                    checked={accStay === "sat_sun"}
                    onSelect={() => setAccStay("sat_sun")}
                    label="Přijedu v sobotu na obřad a přespím (so–ne)"
                  />
                </div>
                {serverErr("accommodation_stay") && (
                  <span className="text-xs text-red-600">
                    {serverErr("accommodation_stay")}
                  </span>
                )}
                <input
                  type="hidden"
                  name="accommodation_stay"
                  value={accStay}
                />
              </div>
            )}
          </div>

          <Field label="Doprava (poznámka)" error={serverErr("transport_notes")}>
            <input
              name="transport_notes"
              defaultValue={val("transport_notes")}
              className={inputCls}
              placeholder="Přivezu se autem / potřebuji odvoz..."
            />
          </Field>
        </div>
      )}

      <Field label="Vzkaz pro novomanžele" error={serverErr("message")}>
        <textarea
          name="message"
          rows={3}
          defaultValue={val("message")}
          className={inputCls}
        />
      </Field>

      <button
        type="submit"
        disabled={submitDisabled}
        className="w-full rounded-md bg-wedding-sage px-6 py-3 text-white font-medium hover:bg-wedding-sage/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending
          ? "Odesílám..."
          : isChecking
            ? "Ověřuji..."
            : hasConflict
              ? "Opravte prosím chyby výše"
              : missingChoice
                ? "Vyberte možnost ubytování"
                : missingStay
                  ? "Vyberte délku pobytu"
                  : "Odeslat potvrzení"}
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

function ChoiceCard({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className={`flex items-center gap-3 rounded-md border px-4 py-3 text-left transition ${
        checked
          ? "border-wedding-sage bg-wedding-sage/10"
          : "border-wedding-ink/20 bg-white hover:border-wedding-sage/60"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
          checked
            ? "border-wedding-sage bg-wedding-sage text-white"
            : "border-wedding-ink/30 bg-white"
        }`}
        aria-hidden="true"
      >
        {checked && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="2 6 5 9 10 3" />
          </svg>
        )}
      </span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

function StayOption({
  value,
  checked,
  onSelect,
  label,
}: {
  value: string;
  checked: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded border px-3 py-2 cursor-pointer transition ${
        checked
          ? "border-wedding-sage bg-wedding-sage/5"
          : "border-wedding-ink/15 hover:border-wedding-sage/50"
      }`}
    >
      <input
        type="radio"
        name="_accommodation_stay_ui"
        value={value}
        checked={checked}
        onChange={onSelect}
        className="mt-1 h-4 w-4 accent-wedding-sage"
      />
      <span className="text-sm leading-snug">{label}</span>
    </label>
  );
}
