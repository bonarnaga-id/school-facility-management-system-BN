import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/admin/dashboard",
  "/sarpras/dashboard",
  "/teknisi/dashboard",
  "/guru/dashboard",
  "/kepsek/dashboard",
];

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect admin API routes
  if (path.startsWith("/api/admin")) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Akses ditolak. Token tidak valid." }, { status: 403 });
    }
  }

  // Protect role dashboard routes
  const isProtected = PROTECTED_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
  if (isProtected) {
    const authToken = request.cookies.get("auth_token")?.value;
    if (!authToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*", "/admin/dashboard/:path*", "/sarpras/dashboard/:path*", "/teknisi/dashboard/:path*", "/guru/dashboard/:path*", "/kepsek/dashboard/:path*"],
};
