"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Download, Pencil, Plus, Search, Trash } from "lucide-react";
import Modal from "./Modal";
import { ENTITIES, type EntityKey, type Row } from "@/lib/entities";
import { deleteRecord, saveRecord } from "@/app/actions/data";

const PAGE_SIZE = 25;

export default function DataManager({ entityKey, rows, canEdit }: { entityKey: EntityKey; rows: Row[]; canEdit: boolean }) {
  const ent = ENTITIES[entityKey];
  const router = useRouter();
  const [q, setQ] = useState("");
  const [wilayah, setWilayah] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [removing, setRemoving] = useState<Row | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const wilayahList = useMemo(() => [...new Set(rows.map((r) => String(r.wilayah ?? "")))].filter(Boolean), [rows]);
  const tableFields = ent.fields.filter((f) => f.inTable && f.name !== "wilayah");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (wilayah && r.wilayah !== wilayah) return false;
      if (!term) return true;
      return ent.fields.some((f) => String(r[f.name] ?? "").toLowerCase().includes(term));
    });
  }, [rows, q, wilayah, ent.fields]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function exportCsv() {
    const cols = ent.fields;
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [cols.map((c) => esc(c.label)).join(";"), ...filtered.map((r) => cols.map((c) => esc(r[c.name])).join(";"))];
    const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${ent.key}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <>
      <div className="card">
        <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className="input pl-9" placeholder={ent.searchHint} value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          </div>
          <select className="input md:w-72" value={wilayah} onChange={(e) => { setWilayah(e.target.value); setPage(1); }}>
            <option value="">Semua wilayah ({wilayahList.length})</option>
            {wilayahList.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={exportCsv} title="Unduh hasil filter sebagai CSV (bisa dibuka di Excel)">
              <Download className="h-4 w-4" /> Unduh
            </button>
            {canEdit && (
              <button className="btn-primary" onClick={() => setEditing("new")}>
                <Plus className="h-4 w-4" /> Tambah
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas/60 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Wilayah</th>
                {tableFields.map((f) => <th key={f.name} className="px-4 py-3 font-semibold">{f.label}</th>)}
                {canEdit && <th className="w-24 px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((r) => (
                <tr key={r.id} className="align-top hover:bg-brand-50/40">
                  <td className="px-4 py-3">
                    <span className="inline-block whitespace-nowrap rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">{r.wilayah}</span>
                  </td>
                  {tableFields.map((f) => (
                    <td key={f.name} className={`px-4 py-3 ${f.name === ent.primary ? "font-semibold" : ""} ${f.wide ? "min-w-56" : "whitespace-nowrap"}`}>
                      {r[f.name] ? String(r[f.name]) : <span className="text-muted/50">—</span>}
                    </td>
                  ))}
                  {canEdit && (
                    <td className="whitespace-nowrap px-4 py-2 text-right">
                      <button className="icon-btn" onClick={() => setEditing(r)} aria-label="Ubah"><Pencil className="h-4 w-4" /></button>
                      <button className="icon-btn hover:text-red-600!" onClick={() => setRemoving(r)} aria-label="Hapus"><Trash className="h-4 w-4" /></button>
                    </td>
                  )}
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={tableFields.length + 2} className="px-4 py-12 text-center text-muted">Tidak ada data yang cocok.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm text-muted">
          <span>{filtered.length} data{filtered.length !== rows.length && ` (dari ${rows.length})`}</span>
          <div className="flex items-center gap-1">
            <button className="icon-btn" disabled={current <= 1} onClick={() => setPage(current - 1)} aria-label="Sebelumnya"><ChevronLeft className="h-4 w-4" /></button>
            <span className="px-2">Hal. {current} / {pages}</span>
            <button className="icon-btn" disabled={current >= pages} onClick={() => setPage(current + 1)} aria-label="Berikutnya"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {editing && (
        <RecordForm entityKey={entityKey} row={editing === "new" ? null : editing} wilayahList={wilayahList}
          defaultWilayah={wilayah}
          onClose={() => setEditing(null)}
          onSaved={(msg) => { setEditing(null); flash(msg); router.refresh(); }} />
      )}
      {removing && (
        <ConfirmDelete label={String(removing[ent.primary] ?? "")} onClose={() => setRemoving(null)}
          onConfirm={async () => {
            const res = await deleteRecord(entityKey, removing.id);
            if (!res.ok) return res.error ?? "Gagal menghapus.";
            setRemoving(null); flash("Data dihapus."); router.refresh();
          }} />
      )}
      {toast && <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </>
  );
}

function RecordForm({ entityKey, row, wilayahList, defaultWilayah, onClose, onSaved }: {
  entityKey: EntityKey; row: Row | null; wilayahList: string[]; defaultWilayah: string;
  onClose: () => void; onSaved: (msg: string) => void;
}) {
  const ent = ENTITIES[entityKey];
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget).entries());
    start(async () => {
      const res = await saveRecord(entityKey, row?.id ?? null, values);
      if (res.ok) onSaved(row ? "Perubahan disimpan." : "Data ditambahkan.");
      else setError(res.error ?? "Gagal menyimpan.");
    });
  }

  return (
    <Modal title={row ? `Ubah ${ent.singular}` : `Tambah ${ent.singular}`} onClose={onClose} size="lg">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <datalist id="wilayah-list">{wilayahList.map((w) => <option key={w} value={w} />)}</datalist>
        {ent.fields.map((f) => {
          const dv = row ? String(row[f.name] ?? "") : f.name === "wilayah" ? defaultWilayah : "";
          return (
            <div key={f.name} className={f.wide || f.type === "textarea" ? "sm:col-span-2" : ""}>
              <label className="label" htmlFor={f.name}>{f.label}{f.required && <span className="text-red-600"> *</span>}</label>
              {f.type === "textarea" ? (
                <textarea id={f.name} name={f.name} rows={3} className="input" defaultValue={dv} maxLength={f.max} />
              ) : (
                <input id={f.name} name={f.name} className="input" defaultValue={dv} required={f.required} maxLength={f.max}
                  inputMode={f.type === "number" ? "numeric" : undefined} list={f.name === "wilayah" ? "wilayah-list" : undefined}
                  autoComplete="off" />
              )}
            </div>
          );
        })}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{error}</p>}
        {row?.updated_by && (
          <p className="text-xs text-muted sm:col-span-2">
            Terakhir diubah oleh @{row.updated_by}{row.updated_at && ` · ${new Date(row.updated_at).toLocaleString("id-ID")}`}
          </p>
        )}
        <div className="flex justify-end gap-2 sm:col-span-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Batal</button>
          <button className="btn-primary" disabled={pending}>{pending ? "Menyimpan…" : "Simpan"}</button>
        </div>
      </form>
    </Modal>
  );
}

export function ConfirmDelete({ label, onClose, onConfirm }: { label: string; onClose: () => void; onConfirm: () => Promise<string | void> }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <Modal title="Hapus data?" onClose={onClose} size="sm">
      <p className="text-sm">Data <b>{label}</b> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.</p>
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button className="btn-ghost" onClick={onClose}>Batal</button>
        <button className="btn-danger" disabled={pending}
          onClick={() => start(async () => { const err = await onConfirm(); if (err) setError(err); })}>
          {pending ? "Menghapus…" : "Hapus"}
        </button>
      </div>
    </Modal>
  );
}
