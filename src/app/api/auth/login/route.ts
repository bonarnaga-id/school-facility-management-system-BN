import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or, sql } from "drizzle-orm";
import { comparePassword, hashPassword } from "@/lib/auth";

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  try {
    const { login, password } = await req.json();
    if (!login || !password) {
      return NextResponse.json({ error: "Email dan kata sandi wajib diisi" }, { status: 400 });
    }

    const allUsers = await db.select().from(users).where(
      or(eq(users.username, login), eq(users.email, login))
    );
    let user = allUsers[0];

    // Auto-create admin if no users exist yet
    if (!user && login === "admin" && password === "admin123") {
      const hashedPassword = await hashPassword(password);
      const inserted = await db.insert(users).values({
        username: "admin",
        password_hash: hashedPassword,
        nama: "Administrator",
        role: "admin",
        email: "admin@yaabunayya.sch.id",
        jabatan: "Admin Sarpras",
        status: "aktif",
      }).returning();
      user = inserted[0];
    }

    if (!user) {
      return NextResponse.json({ error: "Email atau kata sandi salah" }, { status: 401 });
    }

    if (user.status === "nonaktif") {
      return NextResponse.json({ error: "Akun Anda telah dinonaktifkan. Silakan hubungi Admin." }, { status: 403 });
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Email atau kata sandi salah" }, { status: 401 });
    }

    const token = generateToken();
    await db.update(users).set({ token }).where(eq(users.id, user.id));

    const { password_hash, ...safeUser } = user;
    const response = NextResponse.json({ user: safeUser, token });
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
