"use server";

import { revalidatePath } from "next/cache";
import {
  deleteGiftById,
  insertGift,
  updateGiftFields,
} from "@/lib/db";
import { isAdmin } from "@/lib/auth";

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}

function intFromForm(fd: FormData, key: string): number {
  const raw = fd.get(key);
  if (raw === null || raw === undefined) return 0;
  const cleaned = String(raw).replace(/\s/g, "").replace(",", ".");
  if (cleaned === "") return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function nullableStringFromForm(fd: FormData, key: string): string | null {
  const raw = fd.get(key);
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  return s.length === 0 ? null : s;
}

export async function addGiftAction(formData: FormData) {
  await requireAdmin();
  const donor = String(formData.get("donor_name") ?? "").trim();
  if (donor.length < 1) return;
  await insertGift({
    donor_name: donor,
    amount: intFromForm(formData, "amount"),
    note: nullableStringFromForm(formData, "note"),
  });
  revalidatePath("/admin/tasks");
}

export async function updateGiftAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  const donor = String(formData.get("donor_name") ?? "").trim();
  if (donor.length < 1) return;
  await updateGiftFields(id, {
    donor_name: donor,
    amount: intFromForm(formData, "amount"),
    note: nullableStringFromForm(formData, "note"),
  });
  revalidatePath("/admin/tasks");
}

export async function deleteGiftAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  await deleteGiftById(id);
  revalidatePath("/admin/tasks");
}

export async function deleteAllGiftsAction() {
  await requireAdmin();
  const { getDb } = await import("@/lib/db");
  const db = await getDb();
  await db.execute("DELETE FROM gifts");
  revalidatePath("/admin/tasks");
}
