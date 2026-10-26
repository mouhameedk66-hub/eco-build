
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

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? decodeSession(token) : null;

  // Temporary diagnostic logs. Never log the cookie or token.
  console.log("[auth-debug]", {
    pathname,
    hasCookie: Boolean(token),
    sessionDecoded: Boolean(session),
    role: session?.role ?? null,
    hasAllowedRole: Boolean(
      session && roleBasePath[session.role]
    ),
  });

  if (!session || !roleBasePath[session.role]) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const allowedBase = roleBasePath[session.role];

  if (!pathname.startsWith(allowedBase)) {
    const url = req.nextUrl.clone();
    url.pathname = allowedBase;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
