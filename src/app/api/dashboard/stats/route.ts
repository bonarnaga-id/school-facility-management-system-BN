import { NextResponse } from "next/server";
import { db } from "@/db";
import { aset, pemeliharaan, ruangan, jadwalPemeliharaan } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
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
