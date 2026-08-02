import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ruangan } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await db.update(ruangan).set({
      kode: body.kode,
      nama: body.nama,
      gedung: body.gedung,
      lantai: Number(body.lantai),
      kapasitas: Number(body.kapasitas),
      tipe: body.tipe,
      penanggungJawab: body.penanggungJawab,
      status: body.status,
    }).where(eq(ruangan.id, Number(id))).returning();
    return NextResponse.json(updated[0]);
  } catch (e: any) {
    console.error("[API] PUT /api/ruangan/:id error:", e);
    if (e?.code === "23505") {
      return NextResponse.json({ error: "Kode ruangan sudah digunakan oleh ruangan lain." }, { status: 409 });
    }
    return NextResponse.json({ error: "Gagal update ruangan" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(ruangan).where(eq(ruangan.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal hapus ruangan" }, { status: 500 });
  }
}
