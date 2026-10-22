# Dashboard Data Stakeholder 2026

Dashboard data stakeholder & media wilayah Papua Barat, Papua dan Maluku.
Next.js (App Router) · Supabase (PostgreSQL) · di-deploy ke Vercel lewat GitHub.

## Fitur
- **Login username + password** — semua halaman terkunci; tanpa login otomatis diarahkan ke `/login`.
- **Dashboard** — ringkasan jumlah stakeholder, wilayah, media, kelengkapan kontak, data yang perlu dilengkapi, perubahan terakhir.
- **CRUD Stakeholder & Media** — cari, filter per wilayah, tambah, ubah, hapus, unduh CSV (bisa dibuka di Excel).
- **Manajemen pengguna** — Superadmin/Administrator menambah user, mengatur role, reset password, menonaktifkan, menghapus.
- **Keamanan** — password di-hash bcrypt; sesi JWT di cookie httpOnly (8 jam); akun terkunci 15 menit setelah 5x salah password; reset/ganti password otomatis mengeluarkan sesi lama; database tidak bisa diakses dari browser (RLS aktif, hanya server yang memegang service key).

| Role | Hak akses |
|---|---|
| Super Admin | Semua, termasuk membuat/mengelola Administrator |
| Administrator | Kelola data + tambah/kelola user Editor & Viewer |
| Editor | Tambah, ubah, hapus data |
| Viewer | Hanya melihat & mengunduh |

---

## Langkah deploy

### 1. Supabase
1. Buat project di <https://supabase.com> (pilih region **Southeast Asia (Singapore)**).
2. Buka **SQL Editor** → New query → tempel isi `supabase/schema.sql` → **Run**.
3. New query lagi → tempel isi `supabase/seed.sql` → **Run** (memasukkan 157 stakeholder + 33 media dari file Excel).
4. Buka **Project Settings → API / API Keys**, catat:
   - **Project URL** → untuk `SUPABASE_URL`
   - **service_role key** (atau *Secret key* `sb_secret_…`) → untuk `SUPABASE_SERVICE_ROLE_KEY`

### 2. GitHub
```bash
cd stakeholder-dashboard
git init && git add . && git commit -m "Dashboard stakeholder"
git branch -M main
git remote add origin https://github.com/<akun-anda>/stakeholder-dashboard.git
git push -u origin main
```
Gunakan repository **Private**. File `.env.local` sudah di-`.gitignore` — jangan pernah commit kunci rahasia.

### 3. Vercel
1. <https://vercel.com/new> → **Import** repository GitHub tadi (framework terdeteksi otomatis: Next.js).
2. Di **Environment Variables** isi:

   | Nama | Nilai |
   |---|---|
   | `SUPABASE_URL` | Project URL dari Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role / secret key |
   | `AUTH_SECRET` | string acak ≥ 32 karakter (buat di <https://generate-secret.vercel.app/48> atau `openssl rand -base64 48`) |
3. **Deploy**. Setiap `git push` ke `main` akan otomatis build & deploy ulang.

### 4. Login pertama
- Username: `superadmin`
- Password: `GantiSegera#2026`

**Segera ganti password** di menu **Akun Saya**, lalu tambah pengguna lain di menu **Pengguna**.

---

## Menjalankan di komputer sendiri
```bash
npm install
cp .env.example .env.local   # isi nilainya
npm run dev                  # http://localhost:3000
```

## Lupa password superadmin?
```bash
npm run hash -- "PasswordBaru123"
```
Salin hasilnya, lalu di Supabase SQL Editor:
```sql
update app_users set password_hash = '<hasil-hash>', failed_attempts = 0, locked_until = null
where username = 'superadmin';
```

## Menambah kolom data
Tambahkan kolom di Supabase (`alter table stakeholders add column email text;`), lalu tambahkan satu baris di `lib/entities.ts` — form, tabel, pencarian dan unduhan ikut menyesuaikan.

## Struktur
```
app/(app)/            halaman setelah login (dashboard, stakeholder, media, users, akun)
app/login/            halaman login
app/actions/          server actions (auth, CRUD data, CRUD user) — semua cek role di server
components/           UI (tabel data, form, modal, sidebar)
lib/                  koneksi Supabase, sesi, role, definisi kolom
supabase/schema.sql   tabel + keamanan + superadmin awal
supabase/seed.sql     data awal dari Excel
```
