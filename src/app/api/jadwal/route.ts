import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jadwalPemeliharaan } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const all = await db.select().from(jadwalPemeliharaan).orderBy(desc(jadwalPemeliharaan.tanggalSelanjutnya));
    return NextResponse.json(all);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal memuat jadwal" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inserted = await db.insert(jadwalPemeliharaan).values({
      asetId: body.asetId ? Number(body.asetId) : null,
      judul: body.judul,
      frekuensi: body.frekuensi,
      tanggalSelanjutnya: body.tanggalSelanjutnya,
      penanggungJawab: body.penanggungJawab,
      deskripsi: body.deskripsi,
    }).returning();
    return NextResponse.json(inserted[0]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal menambah jadwal" }, { status: 500 });
  }
}
