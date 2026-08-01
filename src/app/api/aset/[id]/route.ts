import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aset } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await db.update(aset).set({
      nama: body.nama,
      kategori: body.kategori,
      ruanganId: body.ruanganId ? Number(body.ruanganId) : null,
      kondisi: body.kondisi,
      status: body.status,
      tanggalPerolehan: body.tanggalPerolehan,
      harga: body.harga ? String(body.harga) : undefined,
      penanggungJawab: body.penanggungJawab,
      deskripsi: body.deskripsi,
      merk: body.merk,
      tahun: body.tahun ? Number(body.tahun) : null,
      updatedAt: new Date(),
    }).where(eq(aset.id, Number(id))).returning();
    return NextResponse.json(updated[0]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal update aset" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(aset).where(eq(aset.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal hapus aset" }, { status: 500 });
  }
}
