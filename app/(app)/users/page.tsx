import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import UsersManager, { type AppUser } from "@/components/UsersManager";
import { requireUser } from "@/lib/auth";
import { assignableRoles, canManageUsers } from "@/lib/roles";
import { db } from "@/lib/supabase";

export default async function UsersPage() {
  const me = await requireUser();
  if (!canManageUsers(me.role)) redirect("/");
  const { data, error } = await db()
    .from("app_users")
    .select("id, username, full_name, role, is_active, last_login_at, locked_until, created_by, created_at")
    .order("created_at");
  if (error) throw new Error(error.message);
  return (
    <>
      <PageHeader title="Pengguna" subtitle="Tambah dan kelola akun yang dapat masuk ke dashboard." />
      <UsersManager users={(data ?? []) as AppUser[]} me={me} roles={assignableRoles(me.role)} />
    </>
  );
}
