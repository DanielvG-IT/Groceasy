import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  // Protect /app routes: redirect to login if not logged in
  if (pathname.startsWith("/app")) {
    if (!accessToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Prevent logged-in users from accessing /auth routes
  if (
    pathname.startsWith("/auth") ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    if (accessToken) {
      // Redirect logged-in users to /app or dashboard
      return NextResponse.redirect(new URL("/app", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/auth/:path*", "/login", "/register"], // match /app and auth routes
};
