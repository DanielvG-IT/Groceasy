import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;

  // Only protect /app and its subroutes
  if (request.nextUrl.pathname.startsWith("/app")) {
    if (!accessToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"], // everything under /app
};
