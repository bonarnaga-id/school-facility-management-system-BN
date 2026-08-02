import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ruangan } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const all = await db.select().from(ruangan).orderBy(desc(ruangan.createdAt));
    return NextResponse.json(all);
  } catch (e) {
    console.error("[API] GET /api/ruangan error:", e);
    return NextResponse.json({ error: "Gagal memuat ruangan" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[API] POST /api/ruangan body:", body);

    if (!body.nama || !body.nama.trim()) {
      return NextResponse.json({ error: "Nama ruangan wajib diisi" }, { status: 400 });
    }
    if (!body.gedung || !body.gedung.trim()) {
      return NextResponse.json({ error: "Gedung ruangan wajib diisi" }, { status: 400 });
    }

    const kode = (body.kode && body.kode.trim()) || `RNG-${Date.now().toString().slice(-5)}`;
    const inserted = await db.insert(ruangan).values({
      kode,
      nama: body.nama.trim(),
      gedung: body.gedung.trim(),
      lantai: Number(body.lantai) || 1,
      kapasitas: Number(body.kapasitas) || 0,
      tipe: body.tipe || "Kelas",
      penanggungJawab: body.penanggungJawab || null,
      status: body.status || "Aktif",
    }).returning();
    return NextResponse.json(inserted[0]);
  } catch (e: any) {
    console.error("[API] POST /api/ruangan error:", e);
    if (e?.code === "23505") {
      return NextResponse.json({ error: "Kode ruangan sudah digunakan. Gunakan kode lain." }, { status: 409 });
    }
    const message = e instanceof Error ? e.message : "Gagal menambah ruangan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
