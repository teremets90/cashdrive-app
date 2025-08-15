import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";

const PROTECTED_PATHS = ["/profile", "/challenges", "/challenges/update"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  console.log("Middleware:", { pathname, isProtected });

  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("token")?.value;
  console.log("Token from cookie:", token ? "exists" : "missing");

  if (!token || !verifyAuthToken(token)) {
    console.log("Auth failed, redirecting to login");
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  console.log("Auth successful, proceeding");
  return NextResponse.next();
}

export const config = {
  matcher: ["/profile", "/challenges", "/challenges/:path*"],
};


