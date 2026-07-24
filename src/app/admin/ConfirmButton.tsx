"use client";

export default function ConfirmButton({
  action,
  message,
  label,
  variant = "danger",
}: {
  action: () => Promise<void>;
  message: string;
  label: string;
  variant?: "danger" | "primary";
}) {
  const className =
    variant === "danger"
      ? "rounded-md border border-red-400 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100"
      : "rounded-md bg-wedding-sage px-4 py-2 text-sm font-medium text-white hover:bg-wedding-sage/90";
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
