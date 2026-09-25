import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ['@apollo/client', '@apollo/experimental-nextjs-app-support'],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;

// Trigger Next.js dev server restart to pick up new Prisma Client
// Triggering restart...
// Restarting again to ensure globalThis is cleared
// Restart again for GraphQL schema changes
