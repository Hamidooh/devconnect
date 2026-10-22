import NextAuth from "next-auth";
import { authOptions } from "../../../../lib/auth";

// Clean NextAuth handler — no runtime env mutation needed.
// NEXTAUTH_URL must be set correctly in Vercel Dashboard env vars:
//   NEXTAUTH_URL=https://devconnect-sage-pi.vercel.app
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
