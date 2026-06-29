import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from R2 (kalau nanti attachment diimplementasi)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tempmail-worker.danuranggana9.workers.dev",
      },
    ],
  },
};

export default nextConfig;
