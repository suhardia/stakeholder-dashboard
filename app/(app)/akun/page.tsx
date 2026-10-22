import PageHeader from "@/components/PageHeader";
import ChangePasswordForm from "./ChangePasswordForm";
import { requireUser } from "@/lib/auth";
import { ROLE_DESC, ROLE_LABEL } from "@/lib/roles";

export default async function AkunPage() {
  const me = await requireUser();
  return (
    <>
      <PageHeader title="Akun Saya" />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-4 font-bold">Profil</h2>
          <dl className="space-y-3 text-sm">
            <div><dt className="label">Nama</dt><dd>{me.full_name}</dd></div>
            <div><dt className="label">Username</dt><dd>@{me.username}</dd></div>
            <div><dt className="label">Role</dt><dd>{ROLE_LABEL[me.role]} <span className="text-muted">— {ROLE_DESC[me.role]}</span></dd></div>
          </dl>
        </section>
        <section className="card p-5">
          <h2 className="mb-4 font-bold">Ganti password</h2>
          <ChangePasswordForm />
        </section>
      </div>
    </>
  );
}
