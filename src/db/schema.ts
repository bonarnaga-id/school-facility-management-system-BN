import { pgTable, serial, varchar, text, integer, timestamp, date, numeric, pgEnum } from "drizzle-orm/pg-core";

export const kondisiEnum = pgEnum("kondisi_aset", ["Baik", "Rusak Ringan", "Rusak Berat", "Perlu Perbaikan", "Baru"]);
export const statusAsetEnum = pgEnum("status_aset", ["Aktif", "Tidak Aktif", "Dipinjam", "Dalam Perbaikan", "Dihapus"]);
export const kategoriAsetEnum = pgEnum("kategori_aset", ["Elektronik", "Furniture", "Laboratorium", "Olahraga", "Kebersihan", "Kendaraan", "ATK", "Ibadah", "Perpustakaan", "Dapur", "Keamanan"]);
export const statusPemeliharaanEnum = pgEnum("status_pemeliharaan", ["Diajukan", "Disetujui", "Dikerjakan", "Selesai", "Ditolak", "Menunggu Suku Cadang"]);
export const jenisPemeliharaanEnum = pgEnum("jenis_pemeliharaan", ["Rutin", "Perbaikan", "Darurat", "Preventif", "Inspeksi"]);
export const prioritasEnum = pgEnum("prioritas", ["Rendah", "Sedang", "Tinggi", "Mendesak"]);
export const roleEnum = pgEnum("user_role", ["admin", "sarpras", "teknisi", "guru", "kepala_sekolah"]);
export const tipeRuanganEnum = pgEnum("tipe_ruangan", ["Kelas", "Laboratorium", "Perpustakaan", "Kantor", "Masjid", "Aula", "UK S", "Kantin", "Gudang", "Lapangan", "Toilet", "Lainnya"]);
export const frekuensiEnum = pgEnum("frekuensi", ["Harian", "Mingguan", "Bulanan", "Triwulan", "Semester", "Tahunan"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 200 }).notNull(),
  nama: varchar("nama", { length: 200 }).notNull(),
  email: varchar("email", { length: 200 }),
  role: roleEnum("role").notNull().default("guru"),
  jabatan: varchar("jabatan", { length: 200 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ruangan = pgTable("ruangan", {
  id: serial("id").primaryKey(),
  kode: varchar("kode", { length: 50 }).notNull().unique(),
  nama: varchar("nama", { length: 200 }).notNull(),
  gedung: varchar("gedung", { length: 100 }).notNull(),
  lantai: integer("lantai").notNull().default(1),
  kapasitas: integer("kapasitas").default(0),
  tipe: tipeRuanganEnum("tipe").notNull().default("Kelas"),
  penanggungJawab: varchar("penanggung_jawab", { length: 200 }),
  status: varchar("status", { length: 50 }).notNull().default("Aktif"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aset = pgTable("aset", {
  id: serial("id").primaryKey(),
  kodeAset: varchar("kode_aset", { length: 100 }).notNull().unique(),
  nama: varchar("nama", { length: 300 }).notNull(),
  kategori: kategoriAsetEnum("kategori").notNull(),
  ruanganId: integer("ruangan_id").references(() => ruangan.id),
  kondisi: kondisiEnum("kondisi").notNull().default("Baik"),
  status: statusAsetEnum("status").notNull().default("Aktif"),
  tanggalPerolehan: date("tanggal_perolehan"),
  harga: numeric("harga", { precision: 15, scale: 2 }).default("0"),
  penanggungJawab: varchar("penanggung_jawab", { length: 200 }),
  deskripsi: text("deskripsi"),
  merk: varchar("merk", { length: 200 }),
  tahun: integer("tahun"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pemeliharaan = pgTable("pemeliharaan", {
  id: serial("id").primaryKey(),
  kode: varchar("kode", { length: 100 }).notNull().unique(),
  asetId: integer("aset_id").references(() => aset.id),
  judul: varchar("judul", { length: 300 }).notNull(),
  jenis: jenisPemeliharaanEnum("jenis").notNull().default("Perbaikan"),
  prioritas: prioritasEnum("prioritas").notNull().default("Sedang"),
  status: statusPemeliharaanEnum("status").notNull().default("Diajukan"),
  tanggalLapor: timestamp("tanggal_lapor").defaultNow(),
  tanggalTarget: date("tanggal_target"),
  tanggalSelesai: timestamp("tanggal_selesai"),
  pelapor: varchar("pelapor", { length: 200 }).notNull(),
  teknisiId: integer("teknisi_id").references(() => users.id),
  biaya: numeric("biaya", { precision: 15, scale: 2 }).default("0"),
  deskripsi: text("deskripsi"),
  catatanTeknisi: text("catatan_teknisi"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jadwalPemeliharaan = pgTable("jadwal_pemeliharaan", {
  id: serial("id").primaryKey(),
  asetId: integer("aset_id").references(() => aset.id),
  judul: varchar("judul", { length: 300 }).notNull(),
  frekuensi: frekuensiEnum("frekuensi").notNull().default("Bulanan"),
  tanggalSelanjutnya: date("tanggal_selanjutnya").notNull(),
  penanggungJawab: varchar("penanggung_jawab", { length: 200 }),
  deskripsi: text("deskripsi"),
  aktif: integer("aktif").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});
