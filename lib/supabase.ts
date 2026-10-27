import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Klien Supabase sisi server (service role). Tidak pernah dikirim ke browser. */
export function db(): SupabaseClient {
  if (client) return client;
  // Mendukung juga nama variabel yang dibuat otomatis oleh integrasi Supabase ↔ Vercel
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "").trim();
  if (!url) throw new Error("environment variable SUPABASE_URL belum diisi di Vercel.");
  if (!key) throw new Error("environment variable SUPABASE_SERVICE_ROLE_KEY belum diisi di Vercel.");
  if (key.startsWith("sb_publishable_")) throw new Error("SUPABASE_SERVICE_ROLE_KEY berisi publishable key — ganti dengan secret key (sb_secret_…) atau service_role.");
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
