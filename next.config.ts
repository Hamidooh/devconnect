import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ['@apollo/client', '@apollo/experimental-nextjs-app-support'],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
