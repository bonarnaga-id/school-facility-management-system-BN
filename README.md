# Yaa Bunayya — Sistem Manajemen Aset & Pemeliharaan Sekolah

> **Copyright © 2026 Yayasan Tarbiyah Sunnah Yaa Bunayya Palembang**  
> Sistem Manajemen Aset dan Pemeliharaan Sekolah Islam Terpadu Yaa Bunayya Islamic School — TK, SD, SMP.

---

## Daftar Isi

1. [Tentang Sistem](#tentang-sistem)
2. [Fitur Utama](#fitur-utama)
3. [Teknologi](#teknologi)
4. [Struktur Proyek](#struktur-proyek)
5. [Persyaratan](#persyaratan)
6. [Instalasi Lokal](#instalasi-lokal)
7. [Konfigurasi Database (Supabase)](#konfigurasi-database-supabase)
8. [Variabel Lingkungan](#variabel-lingkungan)
9. [Jalankan Aplikasi](#jalankan-aplikasi)
10. [Build & Deploy ke Vercel](#build--deploy-ke-vercel)
11. [Akun Demo](#akun-demo)
12. [Autentikasi & Routing Berbasis Peran](#autentikasi--routing-berbasis-peran)
13. [Dokumentasi API](#dokumentasi-api)
14. [Dokumentasi API Admin](#dokumentasi-api-admin)
15. [Skema Database](#skema-database)
16. [Catatan Pengembang](#catatan-pengembang)

---

## Tentang Sistem

Sistem Manajemen Aset & Pemeliharaan adalah aplikasi web berbasis Next.js yang dirancang untuk mengelola seluruh aset sekolah, ruangan, dan pemeliharaan di Yaa Bunayya Islamic School Palembang. Sistem ini membantu tim Sarpras dan Teknisi dalam mencatat, memantau, dan merencanakan pemeliharaan aset sekolah secara terintegrasi.

---

## Fitur Utama

### Dasbor Sarpras
- Ringkasan total aset, aset yang perlu perbaikan, work order aktif, dan biaya bulanan
- Grafik kondisi aset dan status pemeliharaan
- Jadwal pemeliharaan mendatang
- Aset yang membutuhkan perhatian dan laporan terbaru

### Manajemen Aset
- Tambah, edit, hapus aset
- Pencarian, filter kategori dan kondisi
- Dua tampilan: Grid dan Tabel
- Pelacakan lokasi ruangan, harga, merk, tahun, penanggung jawab

### Manajemen Ruangan
- Tambah, edit, hapus ruangan
- Filter berdasarkan gedung
- Informasi kapasitas, tipe, dan penanggung jawab

### Manajemen Pemeliharaan
- Buat work order perbaikan dari guru dan staff
- Assign teknisi, atur prioritas dan status
- Lacak biaya estimasi dan realisasi
- Update status: Diajukan → Disetujui → Dikerjakan → Selesai

### Jadwal Pemeliharaan Rutin
- Buat jadwal preventif: harian, mingguan, bulanan, triwulan, semester, tahunan
- Hitung otomatis hari tersisa
- Notifikasi visual untuk jadwal mendesak

### Laporan & Analitik
- Rekap biaya pemeliharaan
- Aset bermasalah terbanyak
- Performa teknisi
- Cetak laporan bulanan

---

## Teknologi

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Next.js** | 16.2.6 | Framework React (App Router) |
| **React** | 19.2.6 | UI Library |
| **TypeScript** | 5.9.3 | Bahasa pemrograman |
| **Tailwind CSS** | 4.1.17 | Styling |
| **Drizzle ORM** | 0.45.2 | ORM database |
| **node-postgres (pg)** | 8.20.0 | Driver PostgreSQL |
| **Supabase** | — | Hosted PostgreSQL database |
| **Vercel** | — | Hosting & deployment |

---

## Struktur Proyek

```
school-facility-management-system-BN/
├── src/
│   ├── app/
│   │   ├── api/                      # API Routes (Next.js App Router)
│   │   │   ├── auth/
│   │   │   │   └── login/
│   │   │   │       └── route.ts     # Login endpoint
│   │   │   ├── aset/
│   │   │   │   ├── route.ts         # CRUD aset
│   │   │   │   └── [id]/route.ts    # Get/Update/Delete aset by ID
│   │   │   ├── ruangan/
│   │   │   │   ├── route.ts         # CRUD ruangan
│   │   │   │   └── [id]/route.ts    # Get/Update/Delete ruangan by ID
│   │   │   ├── pemeliharaan/
│   │   │   │   ├── route.ts         # CRUD pemeliharaan
│   │   │   │   └── [id]/route.ts    # Get/Update/Delete pemeliharaan by ID
│   │   │   ├── jadwal/
│   │   │   │   ├── route.ts         # CRUD jadwal
│   │   │   │   └── [id]/route.ts    # Get/Update/Delete jadwal by ID
│   │   │   ├── dashboard/
│   │   │   │   └── stats/
│   │   │   │       └── route.ts     # Statistik dashboard
│   │   │   ├── users/
│   │   │   │   └── route.ts         # List users
│   │   │   ├── seed/
│   │   │   │   └── route.ts         # Seed data demo
│   │   │   └── health/
│   │   │       └── route.ts         # Health check
│   │   ├── globals.css              # Global styles (Tailwind)
│   │   ├── layout.tsx               # Root layout + fonts
│   │   └── page.tsx                 # Single-page application (882 baris)
│   └── db/
│       ├── index.ts                 # Database connection pool
│       └── schema.ts                # Drizzle schema definition
├── drizzle.config.json               # Drizzle ORM config
├── next.config.ts                    # Next.js config
├── tsconfig.json                     # TypeScript config
├── eslint.config.mjs                 # ESLint config
├── postcss.config.mjs                # PostCSS config
├── package.json                      # Dependencies
├── supabase-schema.sql               # SQL schema untuk Supabase
├── supabase-seed.sql                 # SQL seed data
└── .env.local                        # Environment variables (lokal, di-gitignore)
```

---

## Persyaratan

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Supabase** account (untuk database)
- **Vercel** account (untuk deploy)

---

## Instalasi Lokal

```bash
# Clone repository
git clone https://github.com/[username]/school-facility-management-system-BN.git
cd school-facility-management-system-BN

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local dengan DATABASE_URL dari Supabase
```

---

## Konfigurasi Database (Supabase)

### 1. Buat Project Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Klik **New Project**
3. Isi nama project dan password database
4. Tunggu provisioning selesai (~2 menit)

### 2. Dapatkan Connection String

1. Buka project Supabase kamu
2. Navigasi ke **Settings** → **Database**
3. Di bagian **Connection string**, pilih mode **URI**
4. Copy string: `postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:6543/postgres`

### 3. Setup Schema

Buka **Supabase Dashboard** → **SQL Editor**, lalu jalankan secara berurutan:

**File: `supabase-schema.sql`**
```sql
-- Paste seluruh isi file supabase-schema.sql
-- Klik Run untuk membuat tabel, enum, dan index
```

**File: `supabase-seed.sql`**
```sql
-- Paste seluruh isi file supabase-seed.sql
-- Klik Run untuk mengisi data contoh
```

### 4. Isi Data Pendapatan (Opsional)

Untuk menambahkan data pemeliharaan dan jadwal, jalankan endpoint seed:

```bash
# Setelah DATABASE_URL dikonfigurasi, jalankan:
npm run dev
# Buka browser: http://localhost:3000
# Login dengan akun admin, data otomatis terisi jika database kosong
```

Atau panggil API langsung:
```bash
curl -X POST http://localhost:3000/api/seed
```

---

## Variabel Lingkungan

Buat file `.env.local` di root project:

```env
# Supabase PostgreSQL Connection String
# Dapatkan dari Supabase Dashboard → Settings → Database → Connection string (URI mode)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.bjewgisqiskjydebtvmj.supabase.co:6543/postgres

# Supabase Project URL (untuk future client-side features)
NEXT_PUBLIC_SUPABASE_URL=https://bjewgisqiskjydebtvmj.supabase.co

# Supabase Anon Key (untuk future client-side features)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Next.js URL (untuk Vercel deployment)
NEXT_PUBLIC_URL=https://[your-app].vercel.app
```

**Penting:**
- File `.env.local` sudah di-`.gitignore` dan tidak akan di-commit
- Untuk Vercel, set environment variables di **Vercel Dashboard** → **Settings** → **Environment Variables**

---

## Jalankan Aplikasi

```bash
# Development mode
npm run dev
# Buka http://localhost:3000

# Type check
npm run typecheck

# Lint
npm run lint

# Build production
npm run build

# Start production server
npm start
```

---

## Build & Deploy ke Vercel

### 1. Push ke GitHub

```bash
git add .
git commit -m "chore: ready for deployment"
git push origin main
```

### 2. Import ke Vercel

1. Buka [Vercel Dashboard](https://vercel.com/new)
2. Klik **Import Project**
3. Pilih repository GitHub kamu
4. Vercel akan otomatis detect Next.js

### 3. Set Environment Variables di Vercel

Di Vercel Dashboard → Project → **Settings** → **Environment Variables**, tambahkan:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.bjewgisqiskjydebtvmj.supabase.co:6543/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://bjewgisqiskjydebtvmj.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_URL` | `https://[your-app].vercel.app` |

### 4. Redeploy

Setelah environment variables di-set, klik **Redeploy** di Vercel.

### 5. Verifikasi Database

Pastikan schema dan data sudah di-upload ke Supabase sebelum mengakses aplikasi.

---

## Akun Demo

Setelah database di-seed, gunakan akun berikut untuk login:

| Username | Password | Role | Jabatan |
|----------|----------|------|---------|
| `admin` | `admin123` | admin | Kepala Sarpras |
| `sarpras` | `sarpras123` | sarpras | Staff Sarpras |
| `teknisi` | `teknisi123` | teknisi | Teknisi Umum |
| `guru` | `guru123` | guru | Guru Kelas 5A |
| `kepsek` | `kepsek123` | kepala_sekolah | Kepala Sekolah SMP |

---

## Autentikasi & Routing Berbasis Peran

Sistem menggunakan autentikasi berbasis email dan kata sandi dengan token sesi. Setelah login, pengguna secara otomatis diarahkan ke dashboard sesuai perannya.

### Alur Login

1. Pengguna mengakses `/login`
2. Masukkan **email** dan **kata sandi**
3. Sistem memverifikasi kredensial dan memeriksa status akun
4. Jika berhasil, pengguna diarahkan ke dashboard sesuai peran:
   - `admin` → `/admin/dashboard`
   - `sarpras` → `/sarpras/dashboard`
   - `teknisi` → `/teknisi/dashboard`
   - `guru` → `/guru/dashboard`
   - `kepala_sekolah` → `/kepsek/dashboard`

### Proteksi Rute

- Semua dashboard dilindungi oleh **proxy** (`src/proxy.ts`) yang memeriksa cookie `auth_token`
- Jika pengguna tidak terautentikasi, mereka diarahkan ke `/login`
- Jika pengguna dengan peran yang salah mencoba mengakses dashboard lain (misal: guru mengakses `/admin/dashboard`), sistem akan mengarahkan mereka kembali ke dashboard yang sesuai dengan peran mereka
- Tidak ada link pendaftaran publik — semua akun dibuat oleh Admin melalui menu Manajemen Pengguna

### Struktur URL

| Path | Fungsi |
|------|--------|
| `/login` | Halaman login |
| `/` | Redirect otomatis ke dashboard sesuai peran |
| `/admin/dashboard` | Dashboard Admin |
| `/sarpras/dashboard` | Dashboard Sarpras |
| `/teknisi/dashboard` | Dashboard Teknisi |
| `/guru/dashboard` | Dashboard Guru |
| `/kepsek/dashboard` | Dashboard Kepala Sekolah |

### Keamanan

- Kata sandi di-hash menggunakan **bcrypt** sebelum disimpan di database
- Token sesi disimpan dalam cookie `httpOnly` untuk keamanan
- Status pengguna dapat dinonaktifkan oleh Admin (soft delete)
- Jika akun dinonaktifkan, pengguna tidak dapat login dan melihat pesan: *"Akun Anda telah dinonaktifkan. Silakan hubungi Admin."*

---


## Dokumentasi API

### POST `/api/auth/login`
Login pengguna.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "nama": "Ustadz Ahmad Fauzi",
    "role": "admin",
    "jabatan": "Kepala Sarpras"
  },
  "token": "abc123..."
}
```

---

### GET `/api/aset`
Mendapatkan semua aset.

**Query Parameters:**
- `q` (optional) — Pencarian nama/kode/merk
- `kategori` (optional) — Filter kategori
- `kondisi` (optional) — Filter kondisi

---

### GET `/api/ruangan`
Mendapatkan semua ruangan.

**Query Parameters:**
- `q` (optional) — Pencarian nama/kode/gedung

---

### GET `/api/pemeliharaan`
Mendapatkan semua laporan pemeliharaan.

**Query Parameters:**
- `q` (optional) — Pencarian judul/kode/pelapor
- `status` (optional) — Filter status

---

### GET `/api/jadwal`
Mendapatkan semua jadwal pemeliharaan.

**Query Parameters:**
- `q` (optional) — Pencarian judul

---

### GET `/api/dashboard/stats`
Mendapatkan statistik dashboard.

**Response:**
```json
{
  "cards": {
    "totalAset": 16,
    "perluPerbaikan": 2,
    "pemeliharaanAktif": 4,
    "biayaBulanan": 3500000,
    "totalPemeliharaan": 7
  },
  "charts": {
    "byKondisi": [...],
    "byKategori": [...],
    "byStatusPemeliharaan": [...]
  },
  "recent": {
    "asetRusak": [...],
    "pemeliharaan": [...]
  }
}
```

---

### POST `/api/seed`
Mengisi database dengan data contoh.

> **Catatan:** Endpoint ini hanya berjalan jika database kosong.

---

### GET `/api/health`
Health check — verifikasi koneksi database.

**Response:**
```json
{
  "status": "ok",
  "db": "ok"
}
```
---

## Dokumentasi API Admin

> **Catatan:** Semua endpoint admin memerlukan header `Authorization: Bearer <token>` dan hanya dapat diakses oleh pengguna dengan peran `admin`.

### GET `/api/admin/users`
Mendapatkan daftar semua pengguna.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `role` (optional) — Filter berdasarkan peran (`admin`, `sarpras`, `teknisi`, `guru`, `kepala_sekolah`)

**Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "username": "admin",
      "nama": "Ustadz Ahmad Fauzi",
      "email": "admin@yaabunayya.sch.id",
      "role": "admin",
      "status": "aktif",
      "jabatan": "Kepala Sarpras"
    }
  ]
}
```

---

### POST `/api/admin/users`
Membuat pengguna baru.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "userbaru",
  "nama": "Nama Lengkap",
  "email": "user@example.com",
  "role": "guru",
  "jabatan": "Guru Kelas 5B",
  "password": "password123",
  "status": "aktif"
}
```

**Response (201):**
```json
{
  "user": {
    "id": 6,
    "username": "userbaru",
    "nama": "Nama Lengkap",
    "email": "user@example.com",
    "role": "guru",
    "status": "aktif",
    "jabatan": "Guru Kelas 5B"
  }
}
```

---

### PATCH `/api/admin/users/:id`
Mengubah informasi pengguna atau peran.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (semua field opsional):**
```json
{
  "nama": "Nama Baru",
  "email": "emailbaru@example.com",
  "role": "sarpras",
  "jabatan": "Staff Sarpras",
  "password": "passwordbaru"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "nama": "Nama Baru",
    "role": "sarpras",
    "status": "aktif",
    "jabatan": "Staff Sarpras"
  }
}
```

---

### PATCH `/api/admin/users/:id/status`
Mengubah status pengguna antara `aktif` dan `nonaktif`.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "nonaktif"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "nama": "Ustadz Ahmad Fauzi",
    "role": "admin",
    "status": "nonaktif"
  }
}
```

---

### DELETE `/api/admin/users/:id`
Menonaktifkan pengguna (soft delete).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Pengguna berhasil dinonaktifkan"
}
```

---


## Skema Database

### Tabel: `users`

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | SERIAL (PK) | Auto increment |
| `username` | VARCHAR(100) UNIQUE NOT NULL | Username login |
| `password_hash` | VARCHAR(200) NOT NULL | Hash password (bcrypt) |
| `nama` | VARCHAR(200) NOT NULL | Nama lengkap |
| `email` | VARCHAR(200) | Email |
| `role` | user_role NOT NULL DEFAULT 'guru' | Peran pengguna |
| `status` | user_status NOT NULL DEFAULT 'aktif' | Status akun (aktif/nonaktif) |
| `jabatan` | VARCHAR(200) | Jabatan |
| `token` | VARCHAR(200) | Token sesi untuk API |
| `created_at` | TIMESTAMP NOT NULL DEFAULT NOW() | Waktu dibuat |

### Tabel: `ruangan`

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | SERIAL (PK) | Auto increment |
| `kode` | VARCHAR(50) UNIQUE NOT NULL | Kode ruangan (misal: SD-01) |
| `nama` | VARCHAR(200) NOT NULL | Nama ruangan |
| `gedung` | VARCHAR(100) NOT NULL | Gedung |
| `lantai` | INTEGER NOT NULL DEFAULT 1 | Lantai |
| `kapasitas` | INTEGER DEFAULT 0 | Kapasitas orang |
| `tipe` | tipe_ruangan NOT NULL DEFAULT 'Kelas' | Tipe ruangan |
| `penanggung_jawab` | VARCHAR(200) | Penanggung jawab |
| `status` | VARCHAR(50) NOT NULL DEFAULT 'Aktif' | Status |
| `created_at` | TIMESTAMP NOT NULL DEFAULT NOW() | Waktu dibuat |

### Tabel: `aset`

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | SERIAL (PK) | Auto increment |
| `kode_aset` | VARCHAR(100) UNIQUE NOT NULL | Kode aset (misal: ELK-AC-001) |
| `nama` | VARCHAR(300) NOT NULL | Nama aset |
| `kategori` | kategori_aset NOT NULL | Kategori aset |
| `ruangan_id` | INTEGER (FK ke ruangan) | Lokasi ruangan |
| `kondisi` | kondisi_aset NOT NULL DEFAULT 'Baik' | Kondisi fisik |
| `status` | status_aset NOT NULL DEFAULT 'Aktif' | Status aset |
| `tanggal_perolehan` | DATE | Tanggal perolehan |
| `harga` | NUMERIC(15,2) DEFAULT '0' | Nilai/ harga |
| `penanggung_jawab` | VARCHAR(200) | Penanggung jawab |
| `deskripsi` | TEXT | Deskripsi |
| `merk` | VARCHAR(200) | Merek |
| `tahun` | INTEGER | Tahun pembelian |
| `created_at` | TIMESTAMP NOT NULL DEFAULT NOW() | Waktu dibuat |
| `updated_at` | TIMESTAMP NOT NULL DEFAULT NOW() | Waktu diupdate |

### Tabel: `pemeliharaan`

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | SERIAL (PK) | Auto increment |
| `kode` | VARCHAR(100) UNIQUE NOT NULL | Kode work order |
| `aset_id` | INTEGER (FK ke aset) | Aset terkait |
| `judul` | VARCHAR(300) NOT NULL | Judul laporan |
| `jenis` | jenis_pemeliharaan NOT NULL DEFAULT 'Perbaikan' | Jenis |
| `prioritas` | prioritas NOT NULL DEFAULT 'Sedang' | Prioritas |
| `status` | status_pemeliharaan NOT NULL DEFAULT 'Diajukan' | Status |
| `tanggal_lapor` | TIMESTAMP NOT NULL DEFAULT NOW() | Tanggal dilapor |
| `tanggal_target` | DATE | Target selesai |
| `tanggal_selesai` | TIMESTAMP | Tanggal selesai |
| `pelapor` | VARCHAR(200) NOT NULL | Pelapor |
| `teknisi_id` | INTEGER (FK ke users) | Teknisi assigned |
| `biaya` | NUMERIC(15,2) DEFAULT '0' | Biaya |
| `deskripsi` | TEXT | Deskripsi kerusakan |
| `catatan_teknisi` | TEXT | Catatan teknisi |
| `created_at` | TIMESTAMP NOT NULL DEFAULT NOW() | Waktu dibuat |

### Tabel: `jadwal_pemeliharaan`

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | SERIAL (PK) | Auto increment |
| `aset_id` | INTEGER (FK ke aset) | Aset terkait (opsional) |
| `judul` | VARCHAR(300) NOT NULL | Judul jadwal |
| `frekuensi` | frekuensi NOT NULL DEFAULT 'Bulanan' | Frekuensi |
| `tanggal_selanjutnya` | DATE NOT NULL | Tanggal pelaksanaan |
| `penanggung_jawab` | VARCHAR(200) | Penanggung jawab |
| `deskripsi` | TEXT | Deskripsi |
| `aktif` | INTEGER DEFAULT 1 | Status aktif |
| `created_at` | TIMESTAMP NOT NULL DEFAULT NOW() | Waktu dibuat |

---

## Enum Values

### `kondisi_aset`
- `Baik`
- `Rusak Ringan`
- `Rusak Berat`
- `Perlu Perbaikan`
- `Baru`

### `status_aset`
- `Aktif`
- `Tidak Aktif`
- `Dipinjam`
- `Dalam Perbaikan`
- `Dihapus`

### `kategori_aset`
- `Elektronik`
- `Furniture`
- `Laboratorium`
- `Olahraga`
- `Kebersihan`
- `Kendaraan`
- `ATK`
- `Ibadah`
- `Perpustakaan`
- `Dapur`
- `Keamanan`

### `status_pemeliharaan`
- `Diajukan`
- `Disetujui`
- `Dikerjakan`
- `Selesai`
- `Ditolak`
- `Menunggu Suku Cadang`

### `jenis_pemeliharaan`
- `Rutin`
- `Perbaikan`
- `Darurat`
- `Preventif`
- `Inspeksi`

### `prioritas`
- `Rendah`
- `Sedang`
- `Tinggi`
- `Mendesak`

### `user_role`
- `admin`
- `sarpras`
- `teknisi`
- `guru`
- `kepala_sekolah`

### `user_status`
- `aktif`
- `nonaktif`

### `tipe_ruangan`
- `Kelas`
- `Laboratorium`
- `Perpustakaan`
- `Kantor`
- `Masjid`
- `Aula`
- `UKS`
- `Kantin`
- `Gudang`
- `Lapangan`
- `Toilet`
- `Lainnya`

### `frekuensi`
- `Harian`
- `Mingguan`
- `Bulanan`
- `Triwulan`
- `Semester`
- `Tahunan`

---

## Catatan Pengembang

### Arsitektur

Aplikasi ini menggunakan **Single Page Application (SPA)** dalam satu file `page.tsx` dengan tab-based navigation. Semua state dikelola di client-side menggunakan React hooks (`useState`, `useEffect`, `useMemo`).

### Autentikasi

Autentikasi dilakukan secara stateless:
- Login mengirim kredensial ke `/api/auth/login`
- Server memverifikasi dan mengembalikan data user
- Client menyimpan user di `localStorage` sebagai `yb_user`
- Setiap halaman refresh, user di-restore dari `localStorage`

### Database Connection

Database menggunakan **connection pooling** via `pg` library:
- Pool diinisialisasi sekali di `src/db/index.ts`
- Drizzle ORM digunakan untuk query type-safe
- Koneksi menggunakan `DATABASE_URL` environment variable

### Auto-Seeding

Sistem memiliki fitur auto-seeding:
- Saat login pertama kali, jika `totalAset === 0`, sistem otomatis menjalankan `/api/seed`
- Data demo di-load secara otomatis untuk memudahkan testing

### Deployment

- **Frontend:** Vercel (Next.js auto-deploy)
- **Database:** Supabase (PostgreSQL managed)
- **Connection:** Menggunakan Supabase connection pooler (port 6543)

---

## Support

Untuk pertanyaan atau dukungan teknis, hubungi tim Sarpras Yaa Bunayya Islamic School.

---

**Copyright © 2026 Yayasan Tarbiyah Sunnah Yaa Bunayya Palembang**  
*Sistem Manajemen Aset dan Pemeliharaan Sekolah Islam Terpadu*
