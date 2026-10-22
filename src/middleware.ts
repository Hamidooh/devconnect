import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // NextAuth on Vercel needs NEXTAUTH_URL to match the actual request origin.
  // Vercel serverless functions don't persist process.env mutations across
  // invocations, so we inject the canonical URL via a response header that
  // NextAuth reads automatically when NEXTAUTH_URL_INTERNAL is set — but
  // more importantly, we simply let the request through without any redirect.
  //
  // The actual NEXTAUTH_URL is set in the Vercel Dashboard (env vars).
  // This middleware exists only to ensure NO unintended redirects happen.
  return NextResponse.next();
}

export const config = {
  // Only run on NextAuth routes and API routes — skip static assets
  matcher: [
    "/api/auth/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico).*)",
  ],
};
