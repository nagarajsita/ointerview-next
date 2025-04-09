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
};

export default nextConfig;
