-- ============================================================
-- Supabase PostgreSQL Schema
-- School Facility Management System (Yaa Bunayya Islamic School)
-- Generated from drizzle-orm schema
-- ============================================================

-- Enums
CREATE TYPE kondisi_aset AS ENUM ('Baik', 'Rusak Ringan', 'Rusak Berat', 'Perlu Perbaikan', 'Baru');
CREATE TYPE status_aset AS ENUM ('Aktif', 'Tidak Aktif', 'Dipinjam', 'Dalam Perbaikan', 'Dihapus');
CREATE TYPE kategori_aset AS ENUM ('Elektronik', 'Furniture', 'Laboratorium', 'Olahraga', 'Kebersihan', 'Kendaraan', 'ATK', 'Ibadah', 'Perpustakaan', 'Dapur', 'Keamanan');
CREATE TYPE status_pemeliharaan AS ENUM ('Diajukan', 'Disetujui', 'Dikerjakan', 'Selesai', 'Ditolak', 'Menunggu Suku Cadang');
CREATE TYPE jenis_pemeliharaan AS ENUM ('Rutin', 'Perbaikan', 'Darurat', 'Preventif', 'Inspeksi');
CREATE TYPE prioritas AS ENUM ('Rendah', 'Sedang', 'Tinggi', 'Mendesak');
CREATE TYPE user_role AS ENUM ('admin', 'sarpras', 'teknisi', 'guru', 'kepala_sekolah');
CREATE TYPE tipe_ruangan AS ENUM ('Kelas', 'Laboratorium', 'Perpustakaan', 'Kantor', 'Masjid', 'Aula', 'UKS', 'Kantin', 'Gudang', 'Lapangan', 'Toilet', 'Lainnya');
CREATE TYPE frekuensi AS ENUM ('Harian', 'Mingguan', 'Bulanan', 'Triwulan', 'Semester', 'Tahunan');

-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(200) NOT NULL,
  nama VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  role user_role NOT NULL DEFAULT 'guru',
  jabatan VARCHAR(200),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Ruangan (Rooms)
CREATE TABLE ruangan (
  id SERIAL PRIMARY KEY,
  kode VARCHAR(50) NOT NULL UNIQUE,
  nama VARCHAR(200) NOT NULL,
  gedung VARCHAR(100) NOT NULL,
  lantai INTEGER NOT NULL DEFAULT 1,
  kapasitas INTEGER DEFAULT 0,
  tipe tipe_ruangan NOT NULL DEFAULT 'Kelas',
  penanggung_jawab VARCHAR(200),
  status VARCHAR(50) NOT NULL DEFAULT 'Aktif',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Aset (Assets)
CREATE TABLE aset (
  id SERIAL PRIMARY KEY,
  kode_aset VARCHAR(100) NOT NULL UNIQUE,
  nama VARCHAR(300) NOT NULL,
  kategori kategori_aset NOT NULL,
  ruangan_id INTEGER REFERENCES ruangan(id),
  kondisi kondisi_aset NOT NULL DEFAULT 'Baik',
  status status_aset NOT NULL DEFAULT 'Aktif',
  tanggal_perolehan DATE,
  harga NUMERIC(15,2) DEFAULT '0',
  penanggung_jawab VARCHAR(200),
  deskripsi TEXT,
  merk VARCHAR(200),
  tahun INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Pemeliharaan (Maintenance)
CREATE TABLE pemeliharaan (
  id SERIAL PRIMARY KEY,
  kode VARCHAR(100) NOT NULL UNIQUE,
  aset_id INTEGER REFERENCES aset(id),
  judul VARCHAR(300) NOT NULL,
  jenis jenis_pemeliharaan NOT NULL DEFAULT 'Perbaikan',
  prioritas prioritas NOT NULL DEFAULT 'Sedang',
  status status_pemeliharaan NOT NULL DEFAULT 'Diajukan',
  tanggal_lapor TIMESTAMP NOT NULL DEFAULT NOW(),
  tanggal_target DATE,
  tanggal_selesai TIMESTAMP,
  pelapor VARCHAR(200) NOT NULL,
  teknisi_id INTEGER REFERENCES users(id),
  biaya NUMERIC(15,2) DEFAULT '0',
  deskripsi TEXT,
  catatan_teknisi TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Jadwal Pemeliharaan (Maintenance Schedule)
CREATE TABLE jadwal_pemeliharaan (
  id SERIAL PRIMARY KEY,
  aset_id INTEGER REFERENCES aset(id),
  judul VARCHAR(300) NOT NULL,
  frekuensi frekuensi NOT NULL DEFAULT 'Bulanan',
  tanggal_selanjutnya DATE NOT NULL,
  penanggung_jawab VARCHAR(200),
  deskripsi TEXT,
  aktif INTEGER DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_aset_kategori ON aset(kategori);
CREATE INDEX idx_aset_kondisi ON aset(kondisi);
CREATE INDEX idx_aset_ruangan_id ON aset(ruangan_id);
CREATE INDEX idx_pemeliharaan_aset_id ON pemeliharaan(aset_id);
CREATE INDEX idx_pemeliharaan_teknisi_id ON pemeliharaan(teknisi_id);
CREATE INDEX idx_pemeliharaan_status ON pemeliharaan(status);
CREATE INDEX idx_jadwal_tanggal_selanjutnya ON jadwal_pemeliharaan(tanggal_selanjutnya);
