import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function GET() {
  try {
    const all = await db.select({
      id: users.id,
      username: users.username,
      nama: users.nama,
      email: users.email,
      role: users.role,
      jabatan: users.jabatan,
    }).from(users);
    return NextResponse.json(all);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal" }, { status: 500 });
  }
}
