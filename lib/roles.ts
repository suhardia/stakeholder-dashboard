export type Role = "superadmin" | "admin" | "editor" | "viewer";

export const ROLE_LABEL: Record<Role, string> = {
  superadmin: "Super Admin",
  admin: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
};

export const ROLE_DESC: Record<Role, string> = {
  superadmin: "Akses penuh, termasuk mengelola administrator",
  admin: "Kelola data + tambah/kelola user Editor & Viewer",
  editor: "Tambah, ubah, hapus data stakeholder & media",
  viewer: "Hanya melihat dan mengunduh data",
};

const RANK: Record<Role, number> = { viewer: 1, editor: 2, admin: 3, superadmin: 4 };

export const canEditData = (r: Role) => RANK[r] >= RANK.editor;
export const canManageUsers = (r: Role) => RANK[r] >= RANK.admin;

/** Role yang boleh diberikan/dikelola oleh actor. Superadmin: semua. Admin: editor & viewer. */
export function assignableRoles(actor: Role): Role[] {
  if (actor === "superadmin") return ["superadmin", "admin", "editor", "viewer"];
  if (actor === "admin") return ["editor", "viewer"];
  return [];
}
export const canManageTarget = (actor: Role, target: Role) => assignableRoles(actor).includes(target);
