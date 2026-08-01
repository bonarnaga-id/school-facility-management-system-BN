import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aset, pemeliharaan, ruangan, jadwalPemeliharaan, users } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role");
    const userId = searchParams.get("userId");
    const nama = searchParams.get("nama");

    // Teknisi: stats for assigned work orders
    if (role === "teknisi" && userId) {
      const teknisiId = parseInt(userId);
      const myPemeliharaan = await db.select().from(pemeliharaan).where(eq(pemeliharaan.teknisiId, teknisiId));
      const aktif = myPemeliharaan.filter((p: any) => ["Diajukan", "Disetujui", "Dikerjakan"].includes(p.status)).length;
      const selesai = myPemeliharaan.filter((p: any) => p.status === "Selesai").length;
      const mendesak = myPemeliharaan.filter((p: any) => p.prioritas === "Mendesak" && !["Selesai", "Ditolak"].includes(p.status)).length;
      const biaya = myPemeliharaan.filter((p: any) => p.status === "Selesai").reduce((sum: number, p: any) => sum + Number(p.biaya || 0), 0);

      return NextResponse.json({
        cards: {
          totalAset: 0,
          totalRuangan: 0,
          totalPemeliharaan: myPemeliharaan.length,
          perluPerbaikan: mendesak,
          pemeliharaanAktif: aktif,
          biayaBulanan: biaya,
        },
        charts: {
          byKategori: [],
          byKondisi: [],
          byStatusPemeliharaan: [],
        },
        recent: {
          pemeliharaan: myPemeliharaan.slice(0, 5),
          asetRusak: [],
        },
      });
    }

    // Guru: stats for their submitted reports
    if (role === "guru" && nama) {
      const myReports = await db.select().from(pemeliharaan).where(eq(pemeliharaan.pelapor, nama));
      const aktif = myReports.filter((p: any) => ["Diajukan", "Disetujui", "Dikerjakan"].includes(p.status)).length;
      const selesai = myReports.filter((p: any) => p.status === "Selesai").length;
      const menunggu = myReports.filter((p: any) => p.status === "Diajukan").length;

      return NextResponse.json({
        cards: {
          totalAset: 0,
          totalRuangan: 0,
          totalPemeliharaan: myReports.length,
          perluPerbaikan: myReports.filter((p: any) => p.prioritas === "Mendesak" && p.status !== "Selesai").length,
          pemeliharaanAktif: aktif,
          biayaBulanan: 0,
        },
        charts: {
          byKategori: [],
          byKondisi: [],
          byStatusPemeliharaan: [],
        },
        recent: {
          pemeliharaan: myReports.slice(0, 5),
          asetRusak: [],
        },
      });
    }

    // Default: admin, sarpras, kepala_sekolah (full overview)
    const totalAset = await db.select({ count: sql<number>`count(*)` }).from(aset);
    const totalRuangan = await db.select({ count: sql<number>`count(*)` }).from(ruangan);
    const totalPemeliharaan = await db.select({ count: sql<number>`count(*)` }).from(pemeliharaan);
    const perluPerbaikan = await db.select({ count: sql<number>`count(*)` }).from(aset).where(sql`${aset.kondisi} != 'Baik'`);
    const pemeliharaanAktif = await db.select({ count: sql<number>`count(*)` }).from(pemeliharaan).where(sql`${pemeliharaan.status} IN ('Diajukan','Disetujui','Dikerjakan')`);

    const byKategori = await db.execute(sql`
      SELECT kategori, COUNT(*) as jumlah FROM aset GROUP BY kategori
    `);
    const byKondisi = await db.execute(sql`
      SELECT kondisi, COUNT(*) as jumlah FROM aset GROUP BY kondisi
    `);
    const byStatusPemeliharaan = await db.execute(sql`
      SELECT status, COUNT(*) as jumlah FROM pemeliharaan GROUP BY status
    `);
    const recentPemeliharaan = await db.select().from(pemeliharaan).orderBy(sql`${pemeliharaan.tanggalLapor} DESC`).limit(5);
    const asetRusak = await db.select().from(aset).where(sql`${aset.kondisi} != 'Baik'`).limit(6);
    const biayaBulanan = await db.execute(sql`
      SELECT COALESCE(SUM(biaya),0) as total FROM pemeliharaan WHERE status='Selesai' AND EXTRACT(MONTH FROM tanggal_selesai) = EXTRACT(MONTH FROM NOW())
    `);

    return NextResponse.json({
      cards: {
        totalAset: Number(totalAset[0]?.count || 0),
        totalRuangan: Number(totalRuangan[0]?.count || 0),
        totalPemeliharaan: Number(totalPemeliharaan[0]?.count || 0),
        perluPerbaikan: Number(perluPerbaikan[0]?.count || 0),
        pemeliharaanAktif: Number(pemeliharaanAktif[0]?.count || 0),
        biayaBulanan: (biayaBulanan.rows[0] as any)?.total || 0,
      },
      charts: {
        byKategori: byKategori.rows,
        byKondisi: byKondisi.rows,
        byStatusPemeliharaan: byStatusPemeliharaan.rows,
      },
      recent: {
        pemeliharaan: recentPemeliharaan,
        asetRusak,
      }
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal memuat statistik" }, { status: 500 });
  }
}
