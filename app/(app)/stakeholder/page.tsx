import DataManager from "@/components/DataManager";
import PageHeader from "@/components/PageHeader";
import { requireUser } from "@/lib/auth";
import { ENTITIES } from "@/lib/entities";
import { fetchAll } from "@/lib/queries";
import { canEditData } from "@/lib/roles";

export default async function Page() {
  const user = await requireUser();
  const rows = await fetchAll("stakeholders");
  const ent = ENTITIES.stakeholders;
  return (
    <>
      <PageHeader title={ent.title} subtitle={canEditData(user.role) ? "Cari, tambah, ubah, atau hapus data." : "Mode lihat saja — hubungi administrator untuk hak ubah."} />
      <DataManager entityKey="stakeholders" rows={rows} canEdit={canEditData(user.role)} />
    </>
  );
}
