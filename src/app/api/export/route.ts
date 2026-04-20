import { NextResponse } from "next/server";
import { listRsvp, drinkLabel, type RsvpRow } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const COLUMNS: Array<[keyof RsvpRow, string]> = [
  ["id", "ID"],
  ["created_at", "Datum"],
  ["name", "Jméno"],
  ["email", "Email"],
  ["phone", "Telefon"],
  ["attending", "Přijde"],
  ["adults_count", "Dospělí"],
  ["children_count", "Děti"],
  ["companion_name", "Doprovod"],
  ["dietary_notes", "Dieta/alergie"],
  ["drinks", "Nápoje"],
  ["accommodation_needed", "Ubytování"],
  ["transport_notes", "Doprava"],
  ["message", "Vzkaz"],
];

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  if (!(await isAdmin())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const rows = await listRsvp();

  const header = COLUMNS.map(([, label]) => csvEscape(label)).join(";");
  const body = rows
    .map((r) =>
      COLUMNS.map(([key]) => {
        const v = r[key];
        if (key === "attending") return v === 1 ? "Ano" : "Ne";
        if (key === "accommodation_needed") return v === 1 ? "Ano" : "";
        if (key === "drinks") {
          if (!v) return "";
          const labels = String(v)
            .split(",")
            .map((s) => drinkLabel(s))
            .join(", ");
          return csvEscape(labels);
        }
        return csvEscape(v);
      }).join(";"),
    )
    .join("\n");

  // BOM so Excel renders UTF-8 correctly
  const csv = "\uFEFF" + header + "\n" + body;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rsvp-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
