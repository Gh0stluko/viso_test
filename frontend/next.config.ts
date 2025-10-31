import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://backend:4000/:path*", // без /api в цілі, щоб /api/health -> /health
      },
    ];
  },
};

export default nextConfig;