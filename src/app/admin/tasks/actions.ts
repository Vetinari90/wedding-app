"use server";

import { revalidatePath } from "next/cache";
import {
  deleteTaskById,
  insertTask,
  updateTaskFields,
  type TaskStatus,
} from "@/lib/db";
import { isAdmin } from "@/lib/auth";

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}

function intFromForm(fd: FormData, key: string): number {
  const raw = fd.get(key);
  if (raw === null || raw === undefined) return 0;
  // Allow blank → 0; strip spaces; replace comma with dot just in case.
  const cleaned = String(raw).replace(/\s/g, "").replace(",", ".");
  if (cleaned === "") return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  new: "in_progress",
  in_progress: "done",
  done: "new",
};

export async function addTaskAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return;
  await insertTask({
    name,
    planned_cost: intFromForm(formData, "planned_cost"),
    actual_cost: intFromForm(formData, "actual_cost"),
  });
  revalidatePath("/admin/tasks");
}

export async function updateTaskAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return;
  await updateTaskFields(id, {
    name,
    planned_cost: intFromForm(formData, "planned_cost"),
    actual_cost: intFromForm(formData, "actual_cost"),
  });
  revalidatePath("/admin/tasks");
}

export async function deleteTaskAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  await deleteTaskById(id);
  revalidatePath("/admin/tasks");
}

export async function deleteAllTasksAction() {
  await requireAdmin();
  const { getDb } = await import("@/lib/db");
  const db = await getDb();
  await db.execute("DELETE FROM tasks");
  revalidatePath("/admin/tasks");
}

export async function cycleTaskStatusAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const current = String(formData.get("current_status") ?? "") as TaskStatus;
  if (!id || !(current in NEXT_STATUS)) return;
  const next = NEXT_STATUS[current];
  await updateTaskFields(id, { status: next });
  revalidatePath("/admin/tasks");
}

// Seed defaults from the wedding planning notes (one-shot).
const DEFAULT_TASKS: Array<{
  name: string;
  status?: TaskStatus;
  planned_cost?: number;
  actual_cost?: number;
}> = [
  { name: "Zabookovat objekt, prohlídka, podepsat smlouvu", status: "done" },
  { name: "Oddávající / termín na matrice", status: "done" },
  { name: "Poplatek za obřad", planned_cost: 3000 },
  { name: "Pozvánky a web", planned_cost: 450, status: "done" },
  { name: "Obálky a známky (5×20 Kč)", planned_cost: 100 },
  { name: "Řeč oddávajícího" },
  { name: "Potvrzovací e-mail", status: "done" },
  { name: "Prsteny (rodinné zlato, punc)", planned_cost: 25000 },
  { name: "Fotky na vyvěšení" },
  { name: "Auto + řidič (ideálně větší, dodávka)" },
  {
    name: "Dort — cukrárna Janský Sedlčany",
    planned_cost: 4000,
    actual_cost: 2000,
    status: "in_progress",
  },
  { name: "Fotograf — Štěpánka Nycoclast" },
  { name: "Fotokoutek s instax fotákem" },
  { name: "Reprák a Spotify list" },
  { name: "DJ" },
  {
    name: "Jazzové duo",
    planned_cost: 14000,
    actual_cost: 3600,
    status: "in_progress",
  },
  { name: "Lístky růže a tulipánů (Čechovo náměstí)" },
  { name: "Výzdoba — helium", planned_cost: 440 },
  { name: "Výzdoba — látky a květiny na slavobránu", planned_cost: 350 },
  {
    name: "Svatební kytice + výzdoba 13 váziček (2 matky, 2 babičky, svědkyně, vývazek)",
    planned_cost: 5000,
  },
  { name: "Šaty", planned_cost: 2200 },
  { name: "Spona do vlasů", planned_cost: 480 },
  {
    name: "Účes a líčení — Kateřina Kurfürstová",
    planned_cost: 3200,
    actual_cost: 1600,
    status: "in_progress",
  },
  { name: "Jídlo — studený bar (sýry, šunky z Makra)" },
  { name: "Jídlo — gril (maso a ryby od Vojty)" },
  { name: "Sladké — pečení (rodina, vlastní, nákup)" },
  { name: "Pití — pivo (sud), nealko pivo, víno, nealko" },
  { name: "Koktejl bar — rumy, whisky, giny, tonik, bylinky" },
  { name: "Krabice na dary" },
  { name: "Krabičky na výslužky", planned_cost: 450 },
  { name: "Svatební koláčky (400 ks)" },
  { name: "Uhlí na gril" },
  { name: "Vázičky", planned_cost: 423 },
  { name: "Svícny", planned_cost: 370 },
  { name: "Svíčky" },
  { name: "Plastové panáky" },
  { name: "Papíry, pastelky, knížky do dětského koutku" },
  { name: "Konvička na mléčnou pěnu" },
];

export async function seedTasksAction() {
  await requireAdmin();
  for (const t of DEFAULT_TASKS) {
    await insertTask(t);
  }
  revalidatePath("/admin/tasks");
}
