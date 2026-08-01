import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ruangan } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const all = await db.select().from(ruangan).orderBy(desc(ruangan.createdAt));
    return NextResponse.json(all);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal memuat ruangan" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const kode = body.kode || `RNG-${Date.now().toString().slice(-5)}`;
    const inserted = await db.insert(ruangan).values({
      kode,
      nama: body.nama,
      gedung: body.gedung,
      lantai: Number(body.lantai) || 1,
      kapasitas: Number(body.kapasitas) || 0,
      tipe: body.tipe,
      penanggungJawab: body.penanggungJawab,
      status: body.status || "Aktif",
    }).returning();
    return NextResponse.json(inserted[0]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal menambah ruangan" }, { status: 500 });
  }
}
