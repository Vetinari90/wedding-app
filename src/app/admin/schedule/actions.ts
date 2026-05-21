"use server";

import { revalidatePath } from "next/cache";
import {
  deleteScheduleItemById,
  insertScheduleItem,
  updateScheduleItem,
} from "@/lib/db";
import { isAdmin } from "@/lib/auth";

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}

export async function addScheduleItemAction(formData: FormData) {
  await requireAdmin();
  const time = String(formData.get("time") ?? "").trim();
  const activity = String(formData.get("activity") ?? "").trim();
  if (!time || !activity) return;
  await insertScheduleItem({ time, activity });
  revalidatePath("/admin/schedule");
}

export async function updateScheduleItemAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  const time = String(formData.get("time") ?? "").trim();
  const activity = String(formData.get("activity") ?? "").trim();
  if (!time || !activity) return;
  await updateScheduleItem(id, { time, activity });
  revalidatePath("/admin/schedule");
}

export async function deleteScheduleItemAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  await deleteScheduleItemById(id);
  revalidatePath("/admin/schedule");
}

const DEFAULT_SCHEDULE: Array<{ time: string; activity: string }> = [
  {
    time: "13:00 – 14:00",
    activity:
      "Příjezd hostů a ubytování. Přivítání, jednohubky.",
  },
  { time: "14:00 – 14:30", activity: "Obřad. Příprava grilu." },
  {
    time: "14:30 – 15:30",
    activity:
      "Gratulace + skupinové focení (svatební noviny na stůl). Přípitek a proslov svědka. Polévka, salát, sýrové prkénko.",
  },
  {
    time: "15:30 – 17:00",
    activity:
      "Focení novomanželů. Začátek svatebního binga. Křížovka o novomanželích volně na stolech.",
  },
  { time: "16:00 – 19:00", activity: "Živá hudba." },
  { time: "17:30", activity: "Krájení dortu." },
  { time: "18:00", activity: "První tanec." },
  { time: "18:30", activity: "Hod kyticí." },
  { time: "18:45", activity: "Vyhlášení svatebního binga." },
  { time: "19:00 a dál", activity: "Spotify party / volná zábava." },
];

export async function seedScheduleAction() {
  await requireAdmin();
  for (const item of DEFAULT_SCHEDULE) {
    await insertScheduleItem(item);
  }
  revalidatePath("/admin/schedule");
}
