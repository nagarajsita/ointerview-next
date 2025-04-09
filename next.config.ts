import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Other config options here */
  images: {
    remotePatterns: [
      {
        hostname: "*",
      },
    ],
  },
  typescript: {
    // Dangerously allow production builds to complete even if there are type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint errors during the build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
