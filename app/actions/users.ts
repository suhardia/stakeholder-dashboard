"use server";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { db } from "@/lib/supabase";
import { requireUserAdmin } from "@/lib/auth";
import { canManageTarget, type Role } from "@/lib/roles";
import { validatePassword } from "@/lib/password";
import type { ActionResult } from "./data";

const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;

async function loadTarget(id: string) {
  const { data } = await db().from("app_users").select("id, username, role").eq("id", id).maybeSingle();
  return data as { id: string; username: string; role: Role } | null;
}

export async function createUser(input: { username: string; full_name: string; role: string; password: string }): Promise<ActionResult> {
  try {
    const me = await requireUserAdmin();
    const username = input.username.trim().toLowerCase();
    const full_name = input.full_name.trim();
    const role = input.role as Role;
    if (!USERNAME_RE.test(username)) return { ok: false, error: "Username 3–32 karakter: huruf kecil, angka, titik, minus, atau garis bawah." };
    if (!full_name) return { ok: false, error: "Nama lengkap wajib diisi." };
    if (!canManageTarget(me.role, role)) return { ok: false, error: "Anda tidak boleh membuat user dengan role tersebut." };
    const pwErr = validatePassword(input.password);
    if (pwErr) return { ok: false, error: pwErr };

    const { error } = await db().from("app_users").insert({
      username, full_name, role, password_hash: await bcrypt.hash(input.password, 10), created_by: me.username,
    });
    if (error) return { ok: false, error: error.code === "23505" ? "Username sudah dipakai." : error.message };
    revalidatePath("/users");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateUser(id: string, input: { full_name: string; role: string; is_active: boolean; password?: string }): Promise<ActionResult> {
  try {
    const me = await requireUserAdmin();
    const target = await loadTarget(id);
    if (!target) return { ok: false, error: "User tidak ditemukan." };
    const isSelf = target.id === me.id;
    if (!isSelf && !canManageTarget(me.role, target.role)) return { ok: false, error: "Anda tidak boleh mengubah user ini." };

    const patch: Record<string, unknown> = { full_name: input.full_name.trim() };
    if (!patch.full_name) return { ok: false, error: "Nama lengkap wajib diisi." };

    if (!isSelf) {
      if (!canManageTarget(me.role, input.role as Role)) return { ok: false, error: "Role tidak diizinkan." };
      patch.role = input.role;
      patch.is_active = !!input.is_active;
    }
    if (input.password) {
      const pwErr = validatePassword(input.password);
      if (pwErr) return { ok: false, error: pwErr };
      patch.password_hash = await bcrypt.hash(input.password, 10);
      patch.failed_attempts = 0;
      patch.locked_until = null;
    }
    const { error } = await db().from("app_users").update(patch).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/users");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  try {
    const me = await requireUserAdmin();
    if (id === me.id) return { ok: false, error: "Anda tidak dapat menghapus akun sendiri." };
    const target = await loadTarget(id);
    if (!target) return { ok: false, error: "User tidak ditemukan." };
    if (!canManageTarget(me.role, target.role)) return { ok: false, error: "Anda tidak boleh menghapus user ini." };
    if (target.role === "superadmin") {
      const { count } = await db().from("app_users").select("id", { count: "exact", head: true }).eq("role", "superadmin");
      if ((count ?? 0) <= 1) return { ok: false, error: "Superadmin terakhir tidak dapat dihapus." };
    }
    const { error } = await db().from("app_users").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/users");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
