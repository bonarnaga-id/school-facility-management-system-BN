import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aset } from "@/db/schema";
import { sql, desc, ilike, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const kategori = searchParams.get("kategori");
    const kondisi = searchParams.get("kondisi");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 50;
    const offset = (page - 1) * limit;

    let query = db.select().from(aset).orderBy(desc(aset.createdAt)).limit(limit).offset(offset);
    
    // For filtering, use raw SQL for simplicity
    if (q || kategori || kondisi) {
      let conditions: string[] = [];
      if (q) {
        const result = await db.execute(sql`
          SELECT * FROM aset 
          WHERE nama ILIKE ${'%' + q + '%'} 
          OR kode_aset ILIKE ${'%' + q + '%'}
          OR merk ILIKE ${'%' + q + '%'}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `);
        return NextResponse.json(result.rows);
      }
    }

    const all = await query;
    return NextResponse.json(all);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal memuat aset" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const kode = body.kodeAset || `AST-${Date.now().toString().slice(-6)}`;
    const inserted = await db.insert(aset).values({
      kodeAset: kode,
      nama: body.nama,
      kategori: body.kategori,
      ruanganId: body.ruanganId ? Number(body.ruanganId) : null,
      kondisi: body.kondisi || "Baik",
      status: body.status || "Aktif",
      tanggalPerolehan: body.tanggalPerolehan || null,
      harga: body.harga ? String(body.harga) : "0",
      penanggungJawab: body.penanggungJawab,
      deskripsi: body.deskripsi,
      merk: body.merk,
      tahun: body.tahun ? Number(body.tahun) : null,
    }).returning();
    return NextResponse.json(inserted[0]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal menambah aset" }, { status: 500 });
  }
}
