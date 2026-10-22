import "server-only";
import { db } from "./supabase";
import type { EntityKey, Row } from "./entities";

/** Ambil semua baris (melewati batas 1000 baris default Supabase). */
export async function fetchAll(table: EntityKey): Promise<Row[]> {
  const out: Row[] = [];
  const size = 1000;
  for (let from = 0; ; from += size) {
    const { data, error } = await db()
      .from(table)
      .select("*")
      .order("wilayah")
      .order("no_urut", { nullsFirst: false })
      .order("id")
      .range(from, from + size - 1);
    if (error) throw new Error(error.message);
    out.push(...((data ?? []) as Row[]));
    if (!data || data.length < size) break;
  }
  return out;
}
