import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, decodeSession } from "@/lib/session";

const roleBasePath: Record<string, string> = {
  CONTRACTOR: "/dashboard/contractor",
  CARRIER: "/dashboard/carrier",
  RECYCLER: "/dashboard/recycler",
  AUTHORITY: "/dashboard/authority",
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/dashboard")) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? decodeSession(token) : null;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const allowedBase = roleBasePath[session.role];
  if (allowedBase && !pathname.startsWith(allowedBase)) {
    const url = req.nextUrl.clone();
    url.pathname = allowedBase;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
