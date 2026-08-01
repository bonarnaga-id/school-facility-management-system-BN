import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAdmin, hashPassword } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const roleFilter = url.searchParams.get("role");

    let query: any = db.select().from(users);
    if (roleFilter && ["admin", "sarpras", "teknisi", "guru", "kepala_sekolah"].includes(roleFilter)) {
      query = query.where(eq(users.role, roleFilter as any));
    }
    const allUsers: any = await query.orderBy(users.createdAt);

    // Remove sensitive data
    const safeUsers = allUsers.map((u: any) => {
      const { password_hash: _ph, token: _t, ...safe } = u;
      return safe;
    });

    return NextResponse.json({ users: safeUsers });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal memuat pengguna" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { username, nama, email, role, jabatan, password, status } = body;

    if (!username || !nama || !password) {
      return NextResponse.json({ error: "Username, nama, dan password wajib diisi" }, { status: 400 });
    }

    // Check if username already exists
    const existing = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Username sudah digunakan" }, { status: 409 });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Insert new user
    const [newUser] = await db.insert(users).values({
      username,
      password_hash,
      nama,
      email: email || null,
      role: role || "guru",
      status: status || "aktif",
      jabatan: jabatan || null,
    }).returning();

    const { password_hash: _ph, token: _t, ...safeUser } = newUser as any;
    return NextResponse.json({ user: safeUser }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal membuat pengguna" }, { status: 500 });
  }
}
