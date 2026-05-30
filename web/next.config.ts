import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
    ],
  },
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/:country([a-z]{2})",
          destination: "/",
        },
        {
          source: "/:country([a-z]{2})/:path*",
          destination: "/:path*",
        },
        {
          source: "/organization-platform",
          destination: "/organisation-platform",
        },
        {
          source: "/organization-platform/:path*",
          destination: "/organisation-platform/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
