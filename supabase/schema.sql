-- =====================================================================
-- Dashboard Data Stakeholder — skema database Supabase
-- Jalankan file ini SEKALI di Supabase > SQL Editor, lalu jalankan seed.sql
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- Pengguna aplikasi (login username + password) ----------
create table if not exists public.app_users (
  id              uuid primary key default gen_random_uuid(),
  username        text not null unique check (username ~ '^[a-z0-9._-]{3,32}$'),
  full_name       text not null,
  password_hash   text not null,
  role            text not null default 'viewer'
                  check (role in ('superadmin','admin','editor','viewer')),
  is_active       boolean not null default true,
  failed_attempts int not null default 0,
  locked_until    timestamptz,
  last_login_at   timestamptz,
  created_by      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------- Data stakeholder ----------
create table if not exists public.stakeholders (
  id             bigint generated always as identity primary key,
  wilayah        text not null,
  no_urut        int,
  instansi       text not null,
  nama_pejabat   text,
  alamat_kantor  text,
  telp_fax       text,
  ajudan         text,
  keterangan     text,
  created_by     text,
  updated_by     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists stakeholders_wilayah_idx on public.stakeholders (wilayah);

-- ---------- Data media ----------
create table if not exists public.media (
  id          bigint generated always as identity primary key,
  wilayah     text not null,
  no_urut     int,
  nama_media  text not null,
  pic         text,
  kontak      text,
  keterangan  text,
  created_by  text,
  updated_by  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists media_wilayah_idx on public.media (wilayah);

-- ---------- updated_at otomatis ----------
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_app_users_updated on public.app_users;
create trigger trg_app_users_updated before update on public.app_users
  for each row execute function public.set_updated_at();
drop trigger if exists trg_stakeholders_updated on public.stakeholders;
create trigger trg_stakeholders_updated before update on public.stakeholders
  for each row execute function public.set_updated_at();
drop trigger if exists trg_media_updated on public.media;
create trigger trg_media_updated before update on public.media
  for each row execute function public.set_updated_at();

-- ---------- Keamanan ----------
-- RLS aktif TANPA policy: kunci publik (anon/publishable) tidak bisa membaca
-- atau menulis apa pun. Semua akses hanya lewat server Next.js yang memakai
-- service role key (secret) dan sudah memeriksa sesi login.
alter table public.app_users    enable row level security;
alter table public.stakeholders enable row level security;
alter table public.media        enable row level security;
revoke all on public.app_users, public.stakeholders, public.media from anon, authenticated;

-- ---------- Superadmin awal ----------
-- Username: superadmin   Password: GantiSegera#2026
-- WAJIB ganti password setelah login pertama (menu "Akun Saya").
insert into public.app_users (username, full_name, password_hash, role, created_by)
values ('superadmin', 'Super Administrator',
        extensions.crypt('GantiSegera#2026', extensions.gen_salt('bf', 10)),
        'superadmin', 'system')
on conflict (username) do nothing;
