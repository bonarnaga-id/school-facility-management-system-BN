import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, ruangan, aset, pemeliharaan, jadwalPemeliharaan } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function POST() {
  try {
    // Clear existing (optional) - check if empty first
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      return NextResponse.json({ message: "Data sudah ada, skip seeding", seeded: false });
    }

    // Users
    const seededUsers = await db.insert(users).values([
      { username: "admin", password: "admin123", nama: "Ustadz Ahmad Fauzi", email: "admin@yaabunayya.sch.id", role: "admin", jabatan: "Kepala Sarpras" },
      { username: "sarpras", password: "sarpras123", nama: "Ustadzah Siti Aminah", email: "sarpras@yaabunayya.sch.id", role: "sarpras", jabatan: "Staff Sarpras" },
      { username: "teknisi", password: "teknisi123", nama: "Pak Joko Prasetyo", email: "teknisi@yaabunayya.sch.id", role: "teknisi", jabatan: "Teknisi Umum" },
      { username: "guru", password: "guru123", nama: "Ustadzah Fatimah Zahra", email: "guru@yaabunayya.sch.id", role: "guru", jabatan: "Guru Kelas 5A" },
      { username: "kepsek", password: "kepsek123", nama: "Ustadz Muhammad Ilham", email: "kepsek@yaabunayya.sch.id", role: "kepala_sekolah", jabatan: "Kepala Sekolah SMP" },
    ]).returning();

    // Ruangan
    const seededRuangan = await db.insert(ruangan).values([
      { kode: "TK-A1", nama: "Kelas TK A1 - An Nahl", gedung: "Gedung TK", lantai: 1, kapasitas: 20, tipe: "Kelas", penanggungJawab: "Ustadzah Lina", status: "Aktif" },
      { kode: "TK-A2", nama: "Kelas TK A2 - Al Fil", gedung: "Gedung TK", lantai: 1, kapasitas: 20, tipe: "Kelas", penanggungJawab: "Ustadzah Dewi", status: "Aktif" },
      { kode: "SD-01", nama: "Kelas 1A - Abu Bakar", gedung: "Gedung SD", lantai: 1, kapasitas: 28, tipe: "Kelas", penanggungJawab: "Ustadzah Fatimah", status: "Aktif" },
      { kode: "SD-02", nama: "Kelas 2B - Umar Bin Khattab", gedung: "Gedung SD", lantai: 1, kapasitas: 28, tipe: "Kelas", penanggungJawab: "Ustadz Farid", status: "Aktif" },
      { kode: "SD-03", nama: "Kelas 5A - Utsman", gedung: "Gedung SD", lantai: 2, kapasitas: 30, tipe: "Kelas", penanggungJawab: "Ustadzah Fatimah", status: "Aktif" },
      { kode: "SD-LAB", nama: "Lab Komputer SD", gedung: "Gedung SD", lantai: 2, kapasitas: 25, tipe: "Laboratorium", penanggungJawab: "Pak Andi", status: "Aktif" },
      { kode: "SMP-01", nama: "Kelas 7A - Al Khawarizmi", gedung: "Gedung SMP", lantai: 1, kapasitas: 32, tipe: "Kelas", penanggungJawab: "Ustadz Ilham", status: "Aktif" },
      { kode: "SMP-02", nama: "Kelas 8B - Ibnu Sina", gedung: "Gedung SMP", lantai: 2, kapasitas: 32, tipe: "Kelas", penanggungJawab: "Ustadzah Nur", status: "Aktif" },
      { kode: "SMP-03", nama: "Kelas 9C - Al Biruni", gedung: "Gedung SMP", lantai: 2, kapasitas: 30, tipe: "Kelas", penanggungJawab: "Ustadz Ridwan", status: "Aktif" },
      { kode: "LAB-IPA", nama: "Lab IPA SMP", gedung: "Gedung SMP", lantai: 1, kapasitas: 30, tipe: "Laboratorium", penanggungJawab: "Bu Sari", status: "Aktif" },
      { kode: "MSJD-01", nama: "Masjid Ya Bunayya", gedung: "Gedung Pusat", lantai: 1, kapasitas: 300, tipe: "Masjid", penanggungJawab: "Ustadz Yusuf", status: "Aktif" },
      { kode: "PERPUS", nama: "Perpustakaan", gedung: "Gedung Pusat", lantai: 2, kapasitas: 60, tipe: "Perpustakaan", penanggungJawab: "Ustadzah Aisyah", status: "Aktif" },
      { kode: "AULA", nama: "Aula Utama", gedung: "Gedung Pusat", lantai: 1, kapasitas: 200, tipe: "Aula", penanggungJawab: "Pak Joko", status: "Aktif" },
      { kode: "KTOR-SD", nama: "Kantor Guru SD", gedung: "Gedung SD", lantai: 1, kapasitas: 15, tipe: "Kantor", penanggungJawab: "Ustadzah Aminah", status: "Aktif" },
      { kode: "GUDANG", nama: "Gudang Sarpras", gedung: "Gedung Sarpras", lantai: 1, kapasitas: 0, tipe: "Gudang", penanggungJawab: "Pak Joko", status: "Aktif" },
    ]).returning();

    const ruanganMap: Record<string, number> = {};
    seededRuangan.forEach(r => ruanganMap[r.kode] = r.id);

    // Aset
    const seededAset = await db.insert(aset).values([
      { kodeAset: "ELK-AC-001", nama: "AC Daikin 1 PK Masjid", kategori: "Elektronik", ruanganId: ruanganMap["MSJD-01"], kondisi: "Baik", status: "Aktif", tanggalPerolehan: "2023-01-15", harga: "4500000", penanggungJawab: "Ustadz Yusuf", merk: "Daikin", tahun: 2023, deskripsi: "AC utama masjid, service rutin tiap 3 bulan" },
      { kodeAset: "ELK-AC-002", nama: "AC Daikin 1 PK Kelas 5A", kategori: "Elektronik", ruanganId: ruanganMap["SD-03"], kondisi: "Perlu Perbaikan", status: "Aktif", tanggalPerolehan: "2022-08-10", harga: "4200000", penanggungJawab: "Ustadzah Fatimah", merk: "Daikin", tahun: 2022, deskripsi: "AC tidak dingin, perlu cuci dan isi freon" },
      { kodeAset: "ELK-PRO-001", nama: "Proyektor Epson X05", kategori: "Elektronik", ruanganId: ruanganMap["SMP-01"], kondisi: "Baik", status: "Aktif", tanggalPerolehan: "2023-03-20", harga: "6500000", penanggungJawab: "Pak Andi", merk: "Epson", tahun: 2023, deskripsi: "Proyektor untuk pembelajaran" },
      { kodeAset: "ELK-PRO-002", nama: "Proyektor BenQ Aula", kategori: "Elektronik", ruanganId: ruanganMap["AULA"], kondisi: "Rusak Ringan", status: "Dalam Perbaikan", tanggalPerolehan: "2021-05-12", harga: "7000000", penanggungJawab: "Pak Joko", merk: "BenQ", tahun: 2021, deskripsi: "Lampu proyektor redup, perlu ganti lamp" },
      { kodeAset: "FUR-MJA-001", nama: "Meja Guru Jati", kategori: "Furniture", ruanganId: ruanganMap["SD-01"], kondisi: "Baik", status: "Aktif", tanggalPerolehan: "2022-01-10", harga: "800000", penanggungJawab: "Ustadzah Fatimah", merk: "Lokal", tahun: 2022 },
      { kodeAset: "FUR-KRS-045", nama: "Kursi Siswa SD (30 unit)", kategori: "Furniture", ruanganId: ruanganMap["SD-03"], kondisi: "Baik", status: "Aktif", tanggalPerolehan: "2022-07-01", harga: "15000000", penanggungJawab: "Sarpras", tahun: 2022 },
      { kodeAset: "FUR-KRS-046", nama: "Kursi Siswa SMP Retak", kategori: "Furniture", ruanganId: ruanganMap["SMP-02"], kondisi: "Rusak Ringan", status: "Aktif", tanggalPerolehan: "2020-06-15", harga: "300000", penanggungJawab: "Ustadzah Nur", deskripsi: "Kaki kursi patah 2 unit" },
      { kodeAset: "LAB-MIK-001", nama: "Mikroskop Binokuler", kategori: "Laboratorium", ruanganId: ruanganMap["LAB-IPA"], kondisi: "Baik", status: "Aktif", tanggalPerolehan: "2023-02-10", harga: "3500000", penanggungJawab: "Bu Sari", merk: "Olympus", tahun: 2023 },
      { kodeAset: "LAB-TAB-010", nama: "Tabung Reaksi Set", kategori: "Laboratorium", ruanganId: ruanganMap["LAB-IPA"], kondisi: "Baik", status: "Aktif", tanggalPerolehan: "2023-02-10", harga: "1200000", penanggungJawab: "Bu Sari", tahun: 2023 },
      { kodeAset: "ELK-KOM-015", nama: "PC Lab Komputer 15", kategori: "Elektronik", ruanganId: ruanganMap["SD-LAB"], kondisi: "Rusak Berat", status: "Dalam Perbaikan", tanggalPerolehan: "2019-08-20", harga: "6000000", penanggungJawab: "Pak Andi", merk: "Lenovo", tahun: 2019, deskripsi: "Motherboard rusak, tidak bisa boot" },
      { kodeAset: "OLG-BOLA-001", nama: "Gawang Futsal Portable", kategori: "Olahraga", ruanganId: ruanganMap["GUDANG"], kondisi: "Baik", status: "Aktif", tanggalPerolehan: "2023-06-01", harga: "2500000", penanggungJawab: "Pak Firman" },
      { kodeAset: "IBD-KARP-001", nama: "Karpet Masjid 1 Roll", kategori: "Ibadah", ruanganId: ruanganMap["MSJD-01"], kondisi: "Perlu Perbaikan", status: "Aktif", tanggalPerolehan: "2020-01-20", harga: "8000000", penanggungJawab: "Ustadz Yusuf", deskripsi: "Karpet sobek di saf depan" },
      { kodeAset: "ATK-PRT-001", nama: "Printer Epson L3210 Kantor", kategori: "ATK", ruanganId: ruanganMap["KTOR-SD"], kondisi: "Baik", status: "Aktif", tanggalPerolehan: "2023-04-15", harga: "2800000", penanggungJawab: "Ustadzah Aminah", merk: "Epson" },
      { kodeAset: "KEB-TORE-001", nama: "Toren Air 1000L", kategori: "Kebersihan", ruanganId: ruanganMap["GUDANG"], kondisi: "Baik", status: "Aktif", tanggalPerolehan: "2022-11-11", harga: "2200000", penanggungJawab: "Pak Joko" },
      { kodeAset: "PERP-BUK-001", nama: "Koleksi Buku Sirah Nabawiyah", kategori: "Perpustakaan", ruanganId: ruanganMap["PERPUS"], kondisi: "Baik", status: "Aktif", tanggalPerolehan: "2023-01-01", harga: "5000000", penanggungJawab: "Ustadzah Aisyah" },
      { kodeAset: "ELK-SND-001", nama: "Sound System Masjid", kategori: "Elektronik", ruanganId: ruanganMap["MSJD-01"], kondisi: "Baik", status: "Aktif", tanggalPerolehan: "2022-03-10", harga: "7500000", penanggungJawab: "Ustadz Yusuf" },
    ]).returning();

    const asetMap: Record<string, number> = {};
    seededAset.forEach(a => asetMap[a.kodeAset] = a.id);

    // Pemeliharaan
    await db.insert(pemeliharaan).values([
      { kode: "MNT-2024-001", asetId: asetMap["ELK-AC-002"], judul: "AC Kelas 5A Tidak Dingin", jenis: "Perbaikan", prioritas: "Tinggi", status: "Diajukan", pelapor: "Ustadzah Fatimah", teknisiId: seededUsers[2].id, biaya: "0", deskripsi: "AC sudah 2 minggu tidak dingin, siswa mengeluh kepanasan. Sudah coba bersihkan filter tapi tetap tidak dingin.", tanggalTarget: new Date(Date.now()+ 3*24*3600*1000).toISOString().split('T')[0] },
      { kode: "MNT-2024-002", asetId: asetMap["ELK-PRO-002"], judul: "Ganti Lampu Proyektor Aula", jenis: "Perbaikan", prioritas: "Sedang", status: "Disetujui", pelapor: "Pak Joko", teknisiId: seededUsers[2].id, biaya: "1200000", deskripsi: "Lampu proyektor sudah 3000 jam, pencahayaan redup.", catatanTeknisi: "Sudah pesan lampu, estimasi datang 3 hari" },
      { kode: "MNT-2024-003", asetId: asetMap["FUR-KRS-046"], judul: "Perbaikan Kursi Patah Kelas 8B", jenis: "Perbaikan", prioritas: "Sedang", status: "Dikerjakan", pelapor: "Ustadzah Nur", teknisiId: seededUsers[2].id, biaya: "200000", deskripsi: "2 kursi kaki patah, perlu las dan cat ulang.", catatanTeknisi: "Sedang dilas di bengkel" },
      { kode: "MNT-2024-004", asetId: asetMap["IBD-KARP-001"], judul: "Jahit Karpet Masjid Saf Depan", jenis: "Perbaikan", prioritas: "Tinggi", status: "Diajukan", pelapor: "Ustadz Yusuf", teknisiId: seededUsers[2].id, biaya: "0", deskripsi: "Karpet sobek 30cm, membahayakan jamaah, perlu dijahit segera sebelum Jumat." },
      { kode: "MNT-2024-005", asetId: asetMap["ELK-KOM-015"], judul: "Servis PC Lab No 15 Mati Total", jenis: "Darurat", prioritas: "Mendesak", status: "Menunggu Suku Cadang", pelapor: "Pak Andi", teknisiId: seededUsers[2].id, biaya: "850000", deskripsi: "PC tidak bisa menyala, kemungkinan motherboard. Siswa tidak bisa praktik.", catatanTeknisi: "Menunggu motherboard second, budget terbatas" },
      { kode: "MNT-2024-006", asetId: asetMap["ELK-AC-001"], judul: "Service Rutin AC Masjid 3 Bulanan", jenis: "Rutin", prioritas: "Rendah", status: "Selesai", pelapor: "Ustadz Yusuf", teknisiId: seededUsers[2].id, biaya: "350000", deskripsi: "Cuci AC dan cek freon rutin", catatanTeknisi: "Sudah dicuci, freon masih ok, bersih", tanggalTarget: new Date(Date.now() - 2*24*3600*1000).toISOString().split('T')[0] },
      { kode: "MNT-2024-007", asetId: asetMap["ATK-PRT-001"], judul: "Printer Kantor Paper Jam", jenis: "Perbaikan", prioritas: "Sedang", status: "Selesai", pelapor: "Ustadzah Aminah", teknisiId: seededUsers[2].id, biaya: "0", deskripsi: "Kertas sering nyangkut", catatanTeknisi: "Roller dibersihkan, sudah normal" },
    ]);

    // Jadwal Pemeliharaan
    await db.insert(jadwalPemeliharaan).values([
      { asetId: asetMap["ELK-AC-001"], judul: "Cuci AC Masjid", frekuensi: "Triwulan", tanggalSelanjutnya: new Date(Date.now()+30*24*3600*1000).toISOString().split('T')[0], penanggungJawab: "Pak Joko", deskripsi: "Jadwal rutin cuci AC masjid 3 bulan sekali" },
      { asetId: asetMap["ELK-AC-002"], judul: "Cuci AC Kelas 5A", frekuensi: "Triwulan", tanggalSelanjutnya: new Date(Date.now()+10*24*3600*1000).toISOString().split('T')[0], penanggungJawab: "Pak Joko", deskripsi: "Cuci AC" },
      { asetId: asetMap["KEB-TORE-001"], judul: "Kuras Toren Air", frekuensi: "Bulanan", tanggalSelanjutnya: new Date(Date.now()+5*24*3600*1000).toISOString().split('T')[0], penanggungJawab: "Pak Joko", deskripsi: "Kuras dan bersihkan toren" },
      { asetId: asetMap["ELK-SND-001"], judul: "Cek Sound Masjid Jumat", frekuensi: "Mingguan", tanggalSelanjutnya: new Date(Date.now()+2*24*3600*1000).toISOString().split('T')[0], penanggungJawab: "Ustadz Yusuf", deskripsi: "Pastikan sound siap untuk khutbah Jumat" },
      { asetId: asetMap["OLG-BOLA-001"], judul: "Cek Gawang Futsal", frekuensi: "Bulanan", tanggalSelanjutnya: new Date(Date.now()+15*24*3600*1000).toISOString().split('T')[0], penanggungJawab: "Pak Firman", deskripsi: "Pastikan baut kencang dan jaring tidak sobek" },
      { judul: "Fogging Sekolah", frekuensi: "Bulanan", tanggalSelanjutnya: new Date(Date.now()+7*24*3600*1000).toISOString().split('T')[0], penanggungJawab: "Pak Joko", deskripsi: "Fogging nyamuk seluruh area sekolah" },
      { judul: "Cek APAR Seluruh Gedung", frekuensi: "Triwulan", tanggalSelanjutnya: new Date(Date.now()+20*24*3600*1000).toISOString().split('T')[0], penanggungJawab: "Security", deskripsi: "Pastikan APAR masih berfungsi dan belum expired" },
    ]);

    return NextResponse.json({ message: "Seeding berhasil", seeded: true, users: seededUsers.length, ruangan: seededRuangan.length, aset: seededAset.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal seeding", details: String(e) }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
