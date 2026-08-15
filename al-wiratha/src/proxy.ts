import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { JWT_SECRET as SECRET } from "@/lib/jwt-secret";

const PUBLIC_PATHS = ["/", "/auth/login", "/auth/register", "/auth/accept-invite", "/calculator", "/sitemap.xml", "/robots.txt"];
const API_PUBLIC = ["/api/auth/login", "/api/auth/register", "/api/auth/accept-invite", "/api/track"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    PUBLIC_PATHS.includes(pathname) ||
    API_PUBLIC.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("al-wiratha-token")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "جلسة منتهية" }, { status: 401 });
    }
    const res = NextResponse.redirect(new URL("/auth/login", req.url));
    res.cookies.delete("al-wiratha-token");
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
