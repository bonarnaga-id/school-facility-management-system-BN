-- ============================================================
-- Supabase Seed Data
-- School Facility Management System (Yaa Bunayya Islamic School)
-- Example/demo data to populate the database
-- ============================================================

-- Users (passwords are hashed with bcrypt - demo password: admin123)
INSERT INTO users (username, password_hash, nama, email, role, status, jabatan) VALUES
  ('admin', '$2b$10$G.UhP01CstENHkg/vjbReeiZIXrtuQT8DYx41J5wHYs0K8N0FQARu', 'Ustadz Ahmad Fauzi', 'admin@yaabunayya.sch.id', 'admin', 'aktif', 'Kepala Sarpras'),
  ('sarpras', '$2b$10$G.UhP01CstENHkg/vjbReeiZIXrtuQT8DYx41J5wHYs0K8N0FQARu', 'Ustadzah Siti Aminah', 'sarpras@yaabunayya.sch.id', 'sarpras', 'aktif', 'Staff Sarpras'),
  ('teknisi', '$2b$10$G.UhP01CstENHkg/vjbReeiZIXrtuQT8DYx41J5wHYs0K8N0FQARu', 'Pak Joko Prasetyo', 'teknisi@yaabunayya.sch.id', 'teknisi', 'aktif', 'Teknisi Umum'),
  ('guru', '$2b$10$G.UhP01CstENHkg/vjbReeiZIXrtuQT8DYx41J5wHYs0K8N0FQARu', 'Ustadzah Fatimah Zahra', 'guru@yaabunayya.sch.id', 'guru', 'aktif', 'Guru Kelas 5A'),
  ('kepsek', '$2b$10$G.UhP01CstENHkg/vjbReeiZIXrtuQT8DYx41J5wHYs0K8N0FQARu', 'Ustadz Muhammad Ilham', 'kepsek@yaabunayya.sch.id', 'kepala_sekolah', 'aktif', 'Kepala Sekolah SMP');

-- Ruangan (Rooms)
INSERT INTO ruangan (kode, nama, gedung, lantai, kapasitas, tipe, penanggung_jawab, status) VALUES
  ('TK-A1', 'Kelas TK A1 - An Nahl', 'Gedung TK', 1, 20, 'Kelas', 'Ustadzah Lina', 'Aktif'),
  ('TK-A2', 'Kelas TK A2 - Al Fil', 'Gedung TK', 1, 20, 'Kelas', 'Ustadzah Dewi', 'Aktif'),
  ('SD-01', 'Kelas 1A - Abu Bakar', 'Gedung SD', 1, 28, 'Kelas', 'Ustadzah Fatimah', 'Aktif'),
  ('SD-02', 'Kelas 2B - Umar Bin Khattab', 'Gedung SD', 1, 28, 'Kelas', 'Ustadz Farid', 'Aktif'),
  ('SD-03', 'Kelas 5A - Utsman', 'Gedung SD', 2, 30, 'Kelas', 'Ustadzah Fatimah', 'Aktif'),
  ('SD-LAB', 'Lab Komputer SD', 'Gedung SD', 2, 25, 'Laboratorium', 'Pak Andi', 'Aktif'),
  ('SMP-01', 'Kelas 7A - Al Khawarizmi', 'Gedung SMP', 1, 32, 'Kelas', 'Ustadz Ilham', 'Aktif'),
  ('SMP-02', 'Kelas 8B - Ibnu Sina', 'Gedung SMP', 2, 32, 'Kelas', 'Ustadzah Nur', 'Aktif'),
  ('SMP-03', 'Kelas 9C - Al Biruni', 'Gedung SMP', 2, 30, 'Kelas', 'Ustadz Ridwan', 'Aktif'),
  ('LAB-IPA', 'Lab IPA SMP', 'Gedung SMP', 1, 30, 'Laboratorium', 'Bu Sari', 'Aktif'),
  ('MSJD-01', 'Masjid Ya Bunayya', 'Gedung Pusat', 1, 300, 'Masjid', 'Ustadz Yusuf', 'Aktif'),
  ('PERPUS', 'Perpustakaan', 'Gedung Pusat', 2, 60, 'Perpustakaan', 'Ustadzah Aisyah', 'Aktif'),
  ('AULA', 'Aula Utama', 'Gedung Pusat', 1, 200, 'Aula', 'Pak Joko', 'Aktif'),
  ('KTOR-SD', 'Kantor Guru SD', 'Gedung SD', 1, 15, 'Kantor', 'Ustadzah Aminah', 'Aktif'),
  ('GUDANG', 'Gudang Sarpras', 'Gedung Sarpras', 1, 0, 'Gudang', 'Pak Joko', 'Aktif');

-- Aset (Assets)
INSERT INTO aset (kode_aset, nama, kategori, ruangan_id, kondisi, status, tanggal_perolehan, harga, penanggung_jawab, merk, tahun, deskripsi) VALUES
  ('ELK-AC-001', 'AC Daikin 1 PK Masjid', 'Elektronik', (SELECT id FROM ruangan WHERE kode = 'MSJD-01'), 'Baik', 'Aktif', '2023-01-15', 4500000, 'Ustadz Yusuf', 'Daikin', 2023, 'AC utama masjid, service rutin tiap 3 bulan'),
  ('ELK-AC-002', 'AC Daikin 1 PK Kelas 5A', 'Elektronik', (SELECT id FROM ruangan WHERE kode = 'SD-03'), 'Perlu Perbaikan', 'Aktif', '2022-08-10', 4200000, 'Ustadzah Fatimah', 'Daikin', 2022, 'AC tidak dingin, perlu cuci dan isi freon'),
  ('ELK-PRO-001', 'Proyektor Epson X05', 'Elektronik', (SELECT id FROM ruangan WHERE kode = 'SMP-01'), 'Baik', 'Aktif', '2023-03-20', 6500000, 'Pak Andi', 'Epson', 2023, 'Proyektor untuk pembelajaran'),
  ('ELK-PRO-002', 'Proyektor BenQ Aula', 'Elektronik', (SELECT id FROM ruangan WHERE kode = 'AULA'), 'Rusak Ringan', 'Dalam Perbaikan', '2021-05-12', 7000000, 'Pak Joko', 'BenQ', 2021, 'Lampu proyektor redup, perlu ganti lamp'),
  ('FUR-MJA-001', 'Meja Guru Jati', 'Furniture', (SELECT id FROM ruangan WHERE kode = 'SD-01'), 'Baik', 'Aktif', '2022-01-10', 800000, 'Ustadzah Fatimah', 'Lokal', 2022, NULL),
  ('FUR-KRS-045', 'Kursi Siswa SD (30 unit)', 'Furniture', (SELECT id FROM ruangan WHERE kode = 'SD-03'), 'Baik', 'Aktif', '2022-07-01', 15000000, 'Sarpras', NULL, 2022, NULL),
  ('FUR-KRS-046', 'Kursi Siswa SMP Retak', 'Furniture', (SELECT id FROM ruangan WHERE kode = 'SMP-02'), 'Rusak Ringan', 'Aktif', '2020-06-15', 300000, 'Ustadzah Nur', NULL, 2020, 'Kaki kursi patah 2 unit'),
  ('LAB-MIK-001', 'Mikroskop Binokuler', 'Laboratorium', (SELECT id FROM ruangan WHERE kode = 'LAB-IPA'), 'Baik', 'Aktif', '2023-02-10', 3500000, 'Bu Sari', 'Olympus', 2023, NULL),
  ('LAB-TAB-010', 'Tabung Reaksi Set', 'Laboratorium', (SELECT id FROM ruangan WHERE kode = 'LAB-IPA'), 'Baik', 'Aktif', '2023-02-10', 1200000, 'Bu Sari', NULL, 2023, NULL),
  ('ELK-KOM-015', 'PC Lab Komputer 15', 'Elektronik', (SELECT id FROM ruangan WHERE kode = 'SD-LAB'), 'Rusak Berat', 'Dalam Perbaikan', '2019-08-20', 6000000, 'Pak Andi', 'Lenovo', 2019, 'Motherboard rusak, tidak bisa boot'),
  ('OLG-BOLA-001', 'Gawang Futsal Portable', 'Olahraga', (SELECT id FROM ruangan WHERE kode = 'GUDANG'), 'Baik', 'Aktif', '2023-06-01', 2500000, 'Pak Firman', NULL, 2023, NULL),
  ('IBD-KARP-001', 'Karpet Masjid 1 Roll', 'Ibadah', (SELECT id FROM ruangan WHERE kode = 'MSJD-01'), 'Perlu Perbaikan', 'Aktif', '2020-01-20', 8000000, 'Ustadz Yusuf', NULL, 2020, 'Karpet sobek di saf depan'),
  ('ATK-PRT-001', 'Printer Epson L3210 Kantor', 'ATK', (SELECT id FROM ruangan WHERE kode = 'KTOR-SD'), 'Baik', 'Aktif', '2023-04-15', 2800000, 'Ustadzah Aminah', 'Epson', 2023, NULL),
  ('KEB-TORE-001', 'Toren Air 1000L', 'Kebersihan', (SELECT id FROM ruangan WHERE kode = 'GUDANG'), 'Baik', 'Aktif', '2022-11-11', 2200000, 'Pak Joko', NULL, 2022, NULL),
  ('PERP-BUK-001', 'Koleksi Buku Sirah Nabawiyah', 'Perpustakaan', (SELECT id FROM ruangan WHERE kode = 'PERPUS'), 'Baik', 'Aktif', '2023-01-01', 5000000, 'Ustadzah Aisyah', NULL, 2023, NULL),
  ('ELK-SND-001', 'Sound System Masjid', 'Elektronik', (SELECT id FROM ruangan WHERE kode = 'MSJD-01'), 'Baik', 'Aktif', '2022-03-10', 7500000, 'Ustadz Yusuf', NULL, 2022, NULL);
