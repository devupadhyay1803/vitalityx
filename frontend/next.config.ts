import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Disable strict mode warnings about config we need for the preview env
  allowedDevOrigins: ["*"],
  // Skip type/lint errors at build to keep iteration fast
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
