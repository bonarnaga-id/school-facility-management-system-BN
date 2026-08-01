import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 });
    }
    const allUsers = await db.select().from(users).where(eq(users.username, username));
    // If no users yet, auto seed admin
    let user = allUsers[0];
    if (!user && username === "admin" && password === "admin123") {
      // Fallback if seeding not done
      const inserted = await db.insert(users).values({
        username: "admin",
        password: "admin123",
        nama: "Administrator",
        role: "admin",
        email: "admin@yaabunayya.sch.id",
        jabatan: "Admin Sarpras"
      }).returning();
      user = inserted[0];
    }
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }
    // Return user without password
    const { password: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
