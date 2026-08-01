import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jadwalPemeliharaan } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await db.update(jadwalPemeliharaan).set({
      judul: body.judul,
      frekuensi: body.frekuensi,
      tanggalSelanjutnya: body.tanggalSelanjutnya,
      penanggungJawab: body.penanggungJawab,
      deskripsi: body.deskripsi,
      asetId: body.asetId ? Number(body.asetId) : null,
    }).where(eq(jadwalPemeliharaan.id, Number(id))).returning();
    return NextResponse.json(updated[0]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(jadwalPemeliharaan).where(eq(jadwalPemeliharaan.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal hapus" }, { status: 500 });
  }
}
