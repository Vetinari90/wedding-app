"use client";

export default function DangerWipe({
  count,
  action,
  label,
  noun = "položek",
}: {
  count: number;
  action: () => Promise<void>;
  label: string;
  noun?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !confirm(`Smazat všech ${count} ${noun}? Tato akce je nevratná.`)
        ) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-md border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
      >
        ⚠ {label}
      </button>
    </form>
  );
}
