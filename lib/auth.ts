import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createHash } from "crypto";
import { db } from "./supabase";
import { SESSION_COOKIE, verifySession } from "./session";
import { canEditData, canManageUsers, type Role } from "./roles";

export type CurrentUser = { id: string; username: string; full_name: string; role: Role };

/**
 * Membaca sesi dari cookie lalu memastikan user masih ada & aktif di database.
 * `v` = penanda versi password; jika password diganti/di-reset, sesi lama otomatis tidak berlaku.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const jar = await cookies();
  const s = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!s) return null;
  const { data } = await db()
    .from("app_users")
    .select("id, username, full_name, role, is_active, password_hash")
    .eq("id", s.uid)
    .maybeSingle();
  if (!data || !data.is_active || sessionVersion(data.password_hash) !== s.v) return null;
  return { id: data.id, username: data.username, full_name: data.full_name, role: data.role as Role };
});

export function sessionVersion(hash: string) {
  return createHash("sha256").update(hash).digest("base64url").slice(0, 16);
}

export async function requireUser() {
  const u = await getCurrentUser();
  if (!u) redirect("/login");
  return u;
}

export async function requireEditor() {
  const u = await getCurrentUser();
  if (!u || !canEditData(u.role)) throw new Error("Anda tidak memiliki izin untuk mengubah data.");
  return u;
}

export async function requireUserAdmin() {
  const u = await getCurrentUser();
  if (!u || !canManageUsers(u.role)) throw new Error("Anda tidak memiliki izin mengelola pengguna.");
  return u;
}
