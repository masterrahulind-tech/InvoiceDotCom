import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "invoicedotcom_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev_jwt_secret_replace_in_production"
);

// Routes that require authentication
const protectedPaths = [
  "/dashboard",
  "/invoices",
  "/clients",
  "/settings",
];

// Routes that should redirect to dashboard if already authenticated
const authPaths = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  let isAuthenticated = false;
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch {
      // Invalid token — treat as unauthenticated
    }
  }

  // Check if current path is a protected route
  const isProtectedRoute = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  // Check if current path is an auth route (login/signup)
  const isAuthRoute = authPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    "/((?!api|_next/static|_next/image|favicon.ico|templates).*)",
  ],
};
