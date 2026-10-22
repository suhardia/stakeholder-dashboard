"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/supabase";
import { SESSION_COOKIE, SESSION_HOURS, signSession } from "@/lib/session";
import { getCurrentUser, sessionVersion } from "@/lib/auth";
import { validatePassword } from "@/lib/password";

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;
// Hash dummy agar waktu respons sama walau username tidak ada (mencegah enumerasi user)
const DUMMY_HASH = "$2b$10$FMQBeLvuIG68qqsSLMpbNeX0LI38S/gnUugPodRKvTVGzcqy79OeC";

export type FormState = { error?: string; success?: string; username?: string } | undefined;

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const username = String(form.get("username") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!username || !password) return { error: "Username dan password wajib diisi.", username };

  const { data: u } = await db()
    .from("app_users")
    .select("id, password_hash, is_active, failed_attempts, locked_until")
    .eq("username", username)
    .maybeSingle();

  if (u?.locked_until && new Date(u.locked_until) > new Date()) {
    const mins = Math.ceil((new Date(u.locked_until).getTime() - Date.now()) / 60000);
    return { error: `Akun terkunci sementara karena terlalu banyak percobaan gagal. Coba lagi dalam ${mins} menit.`, username };
  }

  const valid = await bcrypt.compare(password, u?.password_hash ?? DUMMY_HASH);
  if (!u || !valid || !u.is_active) {
    if (u) {
      const fails = (u.failed_attempts ?? 0) + 1;
      await db().from("app_users").update({
        failed_attempts: fails >= MAX_FAILED ? 0 : fails,
        locked_until: fails >= MAX_FAILED ? new Date(Date.now() + LOCK_MINUTES * 60000).toISOString() : null,
      }).eq("id", u.id);
    }
    return { username, error: u && valid && !u.is_active ? "Akun Anda dinonaktifkan. Hubungi administrator." : "Username atau password salah." };
  }

  await db().from("app_users").update({ failed_attempts: 0, locked_until: null, last_login_at: new Date().toISOString() }).eq("id", u.id);

  const token = await signSession({ uid: u.id, v: sessionVersion(u.password_hash) });
  const h = await headers();
  const secure = process.env.NODE_ENV === "production" || h.get("x-forwarded-proto") === "https";
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: SESSION_HOURS * 3600,
  });
  redirect("/");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}

export async function changeOwnPassword(_: FormState, form: FormData): Promise<FormState> {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (next !== confirm) return { error: "Konfirmasi password baru tidak sama." };
  const problem = validatePassword(next);
  if (problem) return { error: problem };

  const { data } = await db().from("app_users").select("password_hash").eq("id", me.id).single();
  if (!data || !(await bcrypt.compare(current, data.password_hash))) return { error: "Password lama salah." };

  const hash = await bcrypt.hash(next, 10);
  const { error } = await db().from("app_users").update({ password_hash: hash }).eq("id", me.id);
  if (error) return { error: error.message };

  // perbarui sesi agar tetap login setelah ganti password
  const token = await signSession({ uid: me.id, v: sessionVersion(hash) });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_HOURS * 3600,
  });
  return { success: "Password berhasil diganti." };
}
