import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use standalone output for production environment
  ...(process.env.ENVIRONMENT === "production" && {
    output: "standalone",
  }),
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://ai-service:8000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
