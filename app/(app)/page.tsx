import Link from "next/link";
import { Landmark, MapPin, Newspaper, Phone } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { requireUser } from "@/lib/auth";
import { fetchAll } from "@/lib/queries";
import type { Row } from "@/lib/entities";

function countBy(rows: Row[]) {
  const m = new Map<string, number>();
  rows.forEach((r) => m.set(String(r.wilayah), (m.get(String(r.wilayah)) ?? 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

export default async function Dashboard() {
  const user = await requireUser();
  const [sh, md] = await Promise.all([fetchAll("stakeholders"), fetchAll("media")]);
  const perWil = countBy(sh);
  const mediaWil = countBy(md);
  const withPhone = sh.filter((r) => r.telp_fax).length;
  const missingName = sh.filter((r) => !r.nama_pejabat);
  const recent: Row[] = [...sh.map((r) => ({ ...r, kind: "s" })), ...md.map((m) => ({ ...m, instansi: m.nama_media, kind: "m" }))]
    .filter((r) => r.updated_at && r.updated_by)
    .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
    .slice(0, 6);
  const max = perWil[0]?.[1] ?? 1;

  const kpis = [
    { label: "Total stakeholder", value: sh.length, icon: Landmark, href: "/stakeholder" },
    { label: "Wilayah / Pemda", value: perWil.length, icon: MapPin, href: "/stakeholder" },
    { label: "Media terdaftar", value: md.length, icon: Newspaper, href: "/media" },
    { label: "Punya nomor telp", value: `${sh.length ? Math.round((withPhone / sh.length) * 100) : 0}%`, sub: `${withPhone} dari ${sh.length}`, icon: Phone, href: "/stakeholder" },
  ];

  return (
    <>
      <PageHeader title={`Halo, ${user.full_name.split(" ")[0]}`} subtitle="Ringkasan data stakeholder wilayah Papua Barat, Papua dan Maluku tahun 2026." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, sub, icon: Icon, href }) => (
          <Link key={label} href={href} className="card group p-5 transition hover:border-brand-500">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">{label}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon className="h-4 w-4" /></span>
            </div>
            <div className="mt-3 text-3xl font-bold tabular-nums">{value}</div>
            {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <h2 className="font-bold">Stakeholder per wilayah</h2>
          <p className="mb-4 text-xs text-muted">Jumlah pejabat/instansi yang tercatat</p>
          <ul className="space-y-2.5">
            {perWil.map(([w, n]) => (
              <li key={w} className="grid grid-cols-[minmax(0,12rem)_1fr_2rem] items-center gap-3 text-sm sm:grid-cols-[minmax(0,16rem)_1fr_2rem]">
                <span className="truncate" title={w}>{w}</span>
                <span className="h-2.5 rounded-full bg-canvas">
                  <span className="block h-full rounded-full bg-brand-500" style={{ width: `${(n / max) * 100}%` }} />
                </span>
                <span className="text-right font-semibold tabular-nums">{n}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-bold">Media per wilayah</h2>
            <ul className="mt-3 divide-y divide-line text-sm">
              {mediaWil.map(([w, n]) => (
                <li key={w} className="flex justify-between py-2"><span>{w}</span><span className="font-semibold tabular-nums">{n}</span></li>
              ))}
            </ul>
          </section>

          <section className="card p-5">
            <h2 className="font-bold">Perlu dilengkapi</h2>
            <p className="text-xs text-muted">Jabatan tanpa nama pejabat</p>
            <ul className="mt-3 space-y-2 text-sm">
              {missingName.slice(0, 6).map((r) => (
                <li key={r.id}><div className="font-medium">{r.instansi}</div><div className="text-xs text-muted">{r.wilayah}</div></li>
              ))}
              {missingName.length === 0 && <li className="text-muted">Semua sudah lengkap.</li>}
              {missingName.length > 6 && <li className="text-xs text-muted">+{missingName.length - 6} lainnya</li>}
            </ul>
          </section>
        </div>
      </div>

      <section className="card mt-6 p-5">
        <h2 className="font-bold">Perubahan terakhir</h2>
        <ul className="mt-3 divide-y divide-line text-sm">
          {recent.map((r) => (
            <li key={`${r.kind}${r.id}`} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <span><span className="font-medium">{String(r.instansi)}</span> <span className="text-muted">· {r.wilayah}</span></span>
              <span className="text-xs text-muted">{r.updated_by ? `@${r.updated_by} · ` : ""}{new Date(String(r.updated_at)).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jayapura" })} WIT</span>
            </li>
          ))}
          {recent.length === 0 && <li className="py-2.5 text-muted">Belum ada perubahan oleh pengguna.</li>}
        </ul>
      </section>
    </>
  );
}
