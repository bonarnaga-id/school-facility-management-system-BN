import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function getAuthUser(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  
  try {
    const user = await db.select().from(users).where(eq(users.token, token)).limit(1);
    if (!user[0]) return null;
    return user[0];
  } catch {
    return null;
  }
}

export async function requireAdmin(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return { error: "Akses ditolak. Silakan login.", status: 401 };
  }
  if (user.status !== "aktif") {
    return { error: "Akun Anda telah dinonaktifkan. Silakan hubungi Admin.", status: 403 };
  }
  if (user.role !== "admin") {
    return { error: "Akses ditolak. Hanya admin yang dapat mengakses.", status: 403 };
  }
  return { user };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
