"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Přehled RSVP" },
  { href: "/admin/tasks", label: "Co zařídit" },
  { href: "/admin/schedule", label: "Harmonogram" },
  { href: "/admin/preview-reminder", label: "Připomínkový email" },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav className="border-b border-wedding-ink/10 bg-white">
      <div className="mx-auto flex max-w-6xl gap-6 px-4">
        {TABS.map((t) => {
          const active = t.href === path;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`-mb-px border-b-2 py-3 text-sm transition ${
                active
                  ? "border-wedding-sage font-semibold text-wedding-ink"
                  : "border-transparent text-wedding-ink/60 hover:text-wedding-ink"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
