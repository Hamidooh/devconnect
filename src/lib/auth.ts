import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcrypt"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) return null

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) return null

        return { id: user.id, email: user.email, name: user.name, image: user.image }
      }
    })
  ],
  // jwt strategy is required for CredentialsProvider to work with PrismaAdapter
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // On first sign-in, user object is available — persist the DB id into the token
      if (user) {
        token.id = user.id
      }
      // For Google sign-in, look up the user in the DB by email to get the real DB id
      if (account?.provider === "google" && token.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } })
        if (dbUser) {
          token.id = dbUser.id
          if (dbUser.name) token.name = dbUser.name
          if (dbUser.image) token.picture = dbUser.image
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        if (token.name) session.user.name = token.name
        if (token.picture) session.user.image = token.picture
      }
      return session
    }
  },
  pages: {
    signIn: "/api/auth/signin",
  }
}
