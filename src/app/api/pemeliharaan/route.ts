import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pemeliharaan } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const all = await db.select().from(pemeliharaan).orderBy(desc(pemeliharaan.tanggalLapor));
    return NextResponse.json(all);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal memuat pemeliharaan" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const kode = body.kode || `MNT-${Date.now().toString().slice(-6)}`;
    const inserted = await db.insert(pemeliharaan).values({
      kode,
      asetId: body.asetId ? Number(body.asetId) : null,
      judul: body.judul,
      jenis: body.jenis,
      prioritas: body.prioritas,
      status: body.status || "Diajukan",
      tanggalTarget: body.tanggalTarget || null,
      pelapor: body.pelapor,
      teknisiId: body.teknisiId ? Number(body.teknisiId) : null,
      biaya: body.biaya ? String(body.biaya) : "0",
      deskripsi: body.deskripsi,
      catatanTeknisi: body.catatanTeknisi,
    }).returning();
    return NextResponse.json(inserted[0]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal menambah pemeliharaan" }, { status: 500 });
  }
}
