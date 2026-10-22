"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/supabase";
import { requireEditor } from "@/lib/auth";
import { ENTITIES, type EntityKey } from "@/lib/entities";

export type ActionResult = { ok: boolean; error?: string };

function entityOf(key: string) {
  if (!(key in ENTITIES)) throw new Error("Entitas tidak dikenal.");
  return ENTITIES[key as EntityKey];
}

export async function saveRecord(key: string, id: number | null, values: Record<string, unknown>): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    const ent = entityOf(key);
    const row: Record<string, string | number | null> = {};
    for (const f of ent.fields) {
      const raw = values[f.name];
      const str = typeof raw === "string" ? raw.trim() : raw == null ? "" : String(raw).trim();
      if (f.required && !str) return { ok: false, error: `${f.label} wajib diisi.` };
      if (f.max && str.length > f.max) return { ok: false, error: `${f.label} terlalu panjang (maks ${f.max} karakter).` };
      if (f.type === "number") {
        if (str && !/^\d{1,6}$/.test(str)) return { ok: false, error: `${f.label} harus berupa angka.` };
        row[f.name] = str ? Number(str) : null;
      } else {
        row[f.name] = str || null;
      }
    }
    row.updated_by = user.username;
    const q = db().from(ent.key);
    const { error } = id
      ? await q.update(row).eq("id", id)
      : await q.insert({ ...row, created_by: user.username });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteRecord(key: string, id: number): Promise<ActionResult> {
  try {
    await requireEditor();
    const ent = entityOf(key);
    if (!Number.isInteger(id)) return { ok: false, error: "ID tidak valid." };
    const { error } = await db().from(ent.key).delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
