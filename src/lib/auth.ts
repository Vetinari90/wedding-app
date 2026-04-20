import { cookies } from "next/headers";
import crypto from "crypto";

export const ADMIN_COOKIE = "admin_session";

function secret(): string {
  return process.env.ADMIN_PASSWORD ?? "no-secret-set";
}

export function makeAdminToken(): string {
  // Simple HMAC of fixed payload — enough when password stays server-side.
  return crypto.createHmac("sha256", secret()).update("admin").digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  if (!process.env.ADMIN_PASSWORD) return false;
  const c = await cookies();
  const token = c.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return token === makeAdminToken();
}
