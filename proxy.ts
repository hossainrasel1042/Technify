import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === "/login";
  const isAdminPage = pathname.startsWith("/admin");

  // ── Read token from HttpOnly cookie first, fallback to Authorization header ─
  const cookieToken = req.cookies.get("token")?.value ?? null;

  const authHeader = req.headers.get("authorization");
  const bearerToken =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  const token = cookieToken ?? bearerToken;

  // ── /login: already has a valid token → redirect to /admin ───────────────
  if (isLoginPage) {
    if (token) {
      try {
        const payload = verifyToken(token);
        if (payload?.id) {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
      } catch {
        // token invalid/expired — let them stay on login
      }
    }
    return NextResponse.next();
  }

  // ── /admin: no token → redirect to login ─────────────────────────────────
  if (isAdminPage) {
    if (!token) {
      return redirectToLogin(req);
    }

    // ── /admin: invalid or expired token → clear cookie + redirect to login ─
    const payload = verifyToken(token);
    if (!payload) {
      const response = redirectToLogin(req);
      response.cookies.set("token", "", { maxAge: 0, path: "/" });
      return response;
    }

    // ── /admin: valid token → forward request with user info in headers ──────
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id",    String(payload.id));
    requestHeaders.set("x-user-email", payload.email);

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

function redirectToLogin(req: NextRequest): NextResponse {
  const loginUrl = new URL("/login", req.url);
  // Preserve the original destination so we can redirect back after login
  loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

// ── Apply middleware to /login and /admin (all nested routes) ─────────────────
export const config = {
  matcher: ["/login", "/admin/:path*"],
};
