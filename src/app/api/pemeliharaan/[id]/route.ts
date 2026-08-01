import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pemeliharaan } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await db.update(pemeliharaan).set({
      judul: body.judul,
      jenis: body.jenis,
      prioritas: body.prioritas,
      status: body.status,
      tanggalTarget: body.tanggalTarget,
      tanggalSelesai: body.status === "Selesai" ? new Date() : null,
      pelapor: body.pelapor,
      teknisiId: body.teknisiId ? Number(body.teknisiId) : null,
      biaya: body.biaya ? String(body.biaya) : undefined,
      deskripsi: body.deskripsi,
      catatanTeknisi: body.catatanTeknisi,
      asetId: body.asetId ? Number(body.asetId) : null,
    }).where(eq(pemeliharaan.id, Number(id))).returning();
    return NextResponse.json(updated[0]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal update pemeliharaan" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(pemeliharaan).where(eq(pemeliharaan.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal hapus" }, { status: 500 });
  }
}
