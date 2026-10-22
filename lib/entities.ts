export type FieldType = "text" | "textarea" | "number";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  inTable?: boolean;
  wide?: boolean;
  max?: number;
};

export type EntityKey = "stakeholders" | "media";

export type Entity = {
  key: EntityKey;
  title: string;
  singular: string;
  path: string;
  primary: string; // kolom judul utama
  searchHint: string;
  fields: Field[];
};

export const ENTITIES: Record<EntityKey, Entity> = {
  stakeholders: {
    key: "stakeholders",
    title: "Data Stakeholder",
    singular: "Stakeholder",
    path: "/stakeholder",
    primary: "instansi",
    searchHint: "Cari instansi, nama pejabat, alamat…",
    fields: [
      { name: "wilayah", label: "Wilayah / Pemda", type: "text", required: true, inTable: true, max: 200 },
      { name: "no_urut", label: "No. Urut", type: "number" },
      { name: "instansi", label: "Instansi / Jabatan", type: "text", required: true, inTable: true, wide: true, max: 300 },
      { name: "nama_pejabat", label: "Nama Pejabat", type: "text", inTable: true, wide: true, max: 300 },
      { name: "alamat_kantor", label: "Alamat Kantor", type: "textarea", inTable: true, wide: true, max: 1000 },
      { name: "telp_fax", label: "Telp / Fax", type: "text", inTable: true, max: 200 },
      { name: "ajudan", label: "Ajudan", type: "text", max: 300 },
      { name: "keterangan", label: "Keterangan", type: "textarea", wide: true, max: 1000 },
    ],
  },
  media: {
    key: "media",
    title: "Data Media",
    singular: "Media",
    path: "/media",
    primary: "nama_media",
    searchHint: "Cari nama media, PIC, kontak…",
    fields: [
      { name: "wilayah", label: "Wilayah", type: "text", required: true, inTable: true, max: 200 },
      { name: "no_urut", label: "No. Urut", type: "number" },
      { name: "nama_media", label: "Nama Media", type: "text", required: true, inTable: true, wide: true, max: 300 },
      { name: "pic", label: "PIC", type: "text", inTable: true, max: 300 },
      { name: "kontak", label: "Kontak Person", type: "text", inTable: true, max: 300 },
      { name: "keterangan", label: "Keterangan", type: "textarea", wide: true, max: 1000 },
    ],
  },
};

export type Row = { id: number; updated_at?: string; updated_by?: string | null } & Record<string, string | number | null | undefined>;
