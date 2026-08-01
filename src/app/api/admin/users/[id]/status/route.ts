import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID pengguna tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["aktif", "nonaktif"].includes(status)) {
      return NextResponse.json({ error: "Status harus 'aktif' atau 'nonaktif'" }, { status: 400 });
    }

    const [updated] = await db.update(users).set({ status }).where(eq(users.id, userId)).returning();
    if (!updated) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    const { password_hash, token, ...safeUser } = updated;
    return NextResponse.json({ user: safeUser });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal update status pengguna" }, { status: 500 });
  }
}
