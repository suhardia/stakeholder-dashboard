"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, ShieldCheck, Trash } from "lucide-react";
import Modal from "./Modal";
import { ConfirmDelete } from "./DataManager";
import { ROLE_DESC, ROLE_LABEL, canManageTarget, type Role } from "@/lib/roles";
import { createUser, deleteUser, updateUser } from "@/app/actions/users";

export type AppUser = {
  id: string; username: string; full_name: string; role: Role; is_active: boolean;
  last_login_at: string | null; locked_until: string | null; created_by: string | null; created_at: string;
};

const ROLE_STYLE: Record<Role, string> = {
  superadmin: "bg-accent/15 text-[#9a5a12]",
  admin: "bg-brand-100 text-brand-700",
  editor: "bg-sky-100 text-sky-800",
  viewer: "bg-canvas text-muted",
};

export default function UsersManager({ users, me, roles }: { users: AppUser[]; me: { id: string; role: Role }; roles: Role[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<AppUser | "new" | null>(null);
  const [removing, setRemoving] = useState<AppUser | null>(null);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button className="btn-primary" onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> Tambah pengguna</button>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas/60 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Pengguna</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Login terakhir</th><th className="px-4 py-3">Dibuat oleh</th><th className="w-24 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => {
              const self = u.id === me.id;
              const manageable = self || canManageTarget(me.role, u.role);
              const locked = u.locked_until && new Date(u.locked_until) > new Date();
              return (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{u.full_name} {self && <span className="text-xs font-normal text-muted">(Anda)</span>}</div>
                    <div className="text-xs text-muted">@{u.username}</div>
                  </td>
                  <td className="px-4 py-3"><span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${ROLE_STYLE[u.role]}`}>{ROLE_LABEL[u.role]}</span></td>
                  <td className="px-4 py-3">
                    {!u.is_active ? <span className="text-red-600">Nonaktif</span> : locked ? <span className="text-accent">Terkunci</span> : <span className="text-brand-600">Aktif</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{u.last_login_at ? new Date(u.last_login_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "Belum pernah"}</td>
                  <td className="px-4 py-3 text-muted">{u.created_by ? `@${u.created_by}` : "—"}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-right">
                    {manageable && <button className="icon-btn" onClick={() => setEditing(u)} aria-label="Ubah"><Pencil className="h-4 w-4" /></button>}
                    {manageable && !self && <button className="icon-btn hover:text-red-600!" onClick={() => setRemoving(u)} aria-label="Hapus"><Trash className="h-4 w-4" /></button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card mt-6 p-5">
        <h2 className="mb-3 flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4 text-brand-600" /> Hak akses per role</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
            <div key={r}><dt className="font-semibold">{ROLE_LABEL[r]}</dt><dd className="text-muted">{ROLE_DESC[r]}</dd></div>
          ))}
        </dl>
      </div>

      {editing && (
        <UserForm user={editing === "new" ? null : editing} self={editing !== "new" && editing.id === me.id} roles={roles}
          onClose={() => setEditing(null)} onSaved={() => { setEditing(null); router.refresh(); }} />
      )}
      {removing && (
        <ConfirmDelete label={`${removing.full_name} (@${removing.username})`} onClose={() => setRemoving(null)}
          onConfirm={async () => {
            const res = await deleteUser(removing.id);
            if (!res.ok) return res.error ?? "Gagal menghapus.";
            setRemoving(null); router.refresh();
          }} />
      )}
    </>
  );
}

function UserForm({ user, self, roles, onClose, onSaved }: { user: AppUser | null; self: boolean; roles: Role[]; onClose: () => void; onSaved: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");
    start(async () => {
      const res = user
        ? await updateUser(user.id, { full_name: get("full_name"), role: get("role") || user.role, is_active: f.get("is_active") === "on", password: get("password") || undefined })
        : await createUser({ username: get("username"), full_name: get("full_name"), role: get("role"), password: get("password") });
      if (res.ok) onSaved(); else setError(res.error ?? "Gagal menyimpan.");
    });
  }

  return (
    <Modal title={user ? "Ubah pengguna" : "Tambah pengguna"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Username</label>
          {user ? <div className="input bg-canvas text-muted">@{user.username}</div>
            : <input name="username" className="input" required pattern="[a-zA-Z0-9._\-]{3,32}" autoComplete="off" autoCapitalize="none" placeholder="mis. budi.santoso" />}
          {!user && <p className="mt-1 text-xs text-muted">3–32 karakter: huruf, angka, titik, minus, garis bawah. Tidak bisa diubah nanti.</p>}
        </div>
        <div>
          <label className="label">Nama lengkap</label>
          <input name="full_name" className="input" required defaultValue={user?.full_name} maxLength={120} />
        </div>
        {!self && (
          <div>
            <label className="label">Role</label>
            <select name="role" className="input" defaultValue={user?.role ?? roles[roles.length - 1]}>
              {roles.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]} — {ROLE_DESC[r]}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="label">{user ? "Reset password (kosongkan jika tidak diubah)" : "Password awal"}</label>
          <input name="password" type="password" className="input" required={!user} minLength={8} maxLength={72} autoComplete="new-password" />
          <p className="mt-1 text-xs text-muted">Minimal 8 karakter, mengandung huruf dan angka. Reset password juga membuka akun yang terkunci.</p>
        </div>
        {user && !self && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked={user.is_active} className="h-4 w-4 accent-brand-600" /> Akun aktif (bisa login)
          </label>
        )}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Batal</button>
          <button className="btn-primary" disabled={pending}>{pending ? "Menyimpan…" : "Simpan"}</button>
        </div>
      </form>
    </Modal>
  );
}
