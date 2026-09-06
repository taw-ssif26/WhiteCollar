import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2 public bucket
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      // Cloudflare custom domains
      {
        protocol: "https",
        hostname: "*.cloudflare.com",
      },
      // Any other CDN the admin might configure
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
