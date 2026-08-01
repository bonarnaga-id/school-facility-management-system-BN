import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAdmin, hashPassword } from "@/lib/auth";

export async function PATCH(
  request: Request,
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
    const { nama, email, role, jabatan, password } = body;

    // Build update object
    const updateData: any = {};
    if (nama) updateData.nama = nama;
    if (email !== undefined) updateData.email = email;
    if (role && ["admin", "sarpras", "teknisi", "guru", "kepala_sekolah"].includes(role)) {
      updateData.role = role;
    }
    if (jabatan !== undefined) updateData.jabatan = jabatan;
    if (password) {
      updateData.password_hash = await hashPassword(password);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Tidak ada data yang diupdate" }, { status: 400 });
    }

    const [updated] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
    if (!updated) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    const { password_hash, token, ...safeUser } = updated;
    return NextResponse.json({ user: safeUser });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal update pengguna" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
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

    // Soft delete by setting status to nonaktif
    const [updated] = await db.update(users).set({ status: "nonaktif" }).where(eq(users.id, userId)).returning();
    if (!updated) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ message: "Pengguna berhasil dinonaktifkan" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal menonaktifkan pengguna" }, { status: 500 });
  }
}
