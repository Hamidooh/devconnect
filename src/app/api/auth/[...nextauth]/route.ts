import NextAuth from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { NextRequest } from "next/server"

const nextAuthHandler = NextAuth(authOptions)

async function handler(req: NextRequest, context: any) {
  if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes("localhost")) {
    const proto = req.headers.get("x-forwarded-proto") || "https"
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host")
    if (host && !host.includes("localhost")) {
      process.env.NEXTAUTH_URL = `${proto}://${host}`
    }
  }
  return nextAuthHandler(req as any, context)
}

export { handler as GET, handler as POST }
