import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcrypt"

const baseAdapter = PrismaAdapter(prisma);

const customAdapter: typeof baseAdapter = {
  ...baseAdapter,
  linkAccount: async (data: any) => {
    // Sanitize account payload: prevent PrismaClientValidationError on extra tokens from Google
    const cleanData = {
      userId: data.userId,
      type: data.type,
      provider: data.provider,
      providerAccountId: data.providerAccountId,
      refresh_token: data.refresh_token ?? null,
      access_token: data.access_token ?? null,
      expires_at: data.expires_at ?? (data.expires_in ? Math.floor(Date.now() / 1000) + data.expires_in : null),
      expires_in: data.expires_in ?? null,
      token_type: data.token_type ?? null,
      scope: data.scope ?? null,
      id_token: data.id_token ?? null,
      session_state: data.session_state ?? null,
    };
    return prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: data.provider,
          providerAccountId: data.providerAccountId,
        }
      },
      update: cleanData,
      create: cleanData,
    });
  },
  createUser: async (data: any) => {
    const { name, email, image, emailVerified } = data;
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return existingUser;
      }
    }
    let username = email ? email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20) : null;
    if (username) {
      const existingUsername = await prisma.user.findUnique({ where: { username } });
      if (existingUsername) {
        username = `${username}_${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }
    return prisma.user.create({
      data: {
        name: name ?? null,
        username,
        email: email ?? null,
        image: image ?? null,
        emailVerified: emailVerified ?? null,
      }
    });
  }
};

export const authOptions: NextAuthOptions = {
  adapter: customAdapter,
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      console.error("[NextAuth Error]", code, metadata);
    },
    warn(code) {
      console.warn("[NextAuth Warn]", code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.log("[NextAuth Debug]", code, metadata);
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "devconnect-super-secret-jwt-key-2026-safe-production-32chars!",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        let user = await prisma.user.findUnique({
          where: { email }
        });

        // 1. If user does not exist in DB: auto-create account so user can log in without friction!
        if (!user) {
          const hashedPassword = await bcrypt.hash(password, 10);
          let username = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20);
          const existingUsername = await prisma.user.findUnique({ where: { username } });
          if (existingUsername) {
            username = `${username}_${Math.floor(1000 + Math.random() * 9000)}`;
          }
          user = await prisma.user.create({
            data: {
              email,
              name: username,
              username,
              password: hashedPassword,
            }
          });
          return { id: user.id, email: user.email, name: user.name, image: user.image };
        }

        // 2. If user exists but has no password (e.g. created via Google first), set it now
        if (!user.password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          user = await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
          });
          return { id: user.id, email: user.email, name: user.name, image: user.image };
        }

        // 3. For the demo test@example.com account, also allow "password123"
        if (email === "test@example.com" && password === "password123") {
          return { id: user.id, email: user.email, name: user.name, image: user.image };
        }

        // 4. Compare entered password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      }
    })
  ],
  // jwt strategy is required for CredentialsProvider to work with PrismaAdapter
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (!token.id && token.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
        if (dbUser) {
          token.id = dbUser.id;
          if (dbUser.name) token.name = dbUser.name;
          if (dbUser.image) token.picture = dbUser.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        if (token.name) session.user.name = token.name;
        if (token.picture) session.user.image = token.picture;
      }
      return session;
    }
  },
  pages: {
    signIn: "/api/auth/signin",
  }
}
