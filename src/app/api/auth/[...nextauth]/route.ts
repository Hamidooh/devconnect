import NextAuth from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { NextRequest } from "next/server";

const nextAuthHandler = NextAuth(authOptions);

async function handler(req: NextRequest, context: any) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");

  if (host) {
    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
    const safeProto = isLocalhost ? proto : "https";
    process.env.NEXTAUTH_URL = `${safeProto}://${host}`;
  }

  return nextAuthHandler(req as any, context);
}

export { handler as GET, handler as POST };
