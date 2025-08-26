import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/fetcher";
import { refreshAccessToken } from "@/lib/fetcher";
import type { NextRequest } from "next/server";

function isTokenExpired(token?: string): boolean {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return true;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    // Pad base64 string if required
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    // atob is available in the Edge runtime used by Next middleware
    const payloadJson = atob(base64);
    const payload = JSON.parse(payloadJson);
    if (!payload || typeof payload.exp !== "number") return true;
    return Date.now() / 1000 >= payload.exp;
  } catch {
    return true;
  }
}

export async function middleware(request: NextRequest) {
  const accessToken = await getAccessToken();
  const { pathname } = request.nextUrl;

  // Protect /app routes: redirect to login if not logged in
  if (pathname.startsWith("/app")) {
    if (!accessToken || isTokenExpired(accessToken)) {
      try {
        const result = await refreshAccessToken();
        if (result.ok) {
          return NextResponse.next();
        }
      } catch (error) {
        console.error("Failed to refresh access token:", error); // TODO: Implement proper error handling
      }

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
