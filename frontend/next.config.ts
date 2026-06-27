import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // Allow our Emergent preview hosts to reach Next dev resources (HMR, fonts)
  allowedDevOrigins: [
    "52cef6a0-1c6b-4e2d-a0d7-036a7e2d1fb4.preview.emergentagent.com",
    "52cef6a0-1c6b-4e2d-a0d7-036a7e2d1fb4.cluster-3.preview.emergentcf.cloud",
    "health-platform-dev-2.cluster-3.preview.emergentcf.cloud",
  ],
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
