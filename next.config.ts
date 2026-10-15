import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev-time on-screen indicator (route/segment explorer) is throwing a
  // recurring "Cannot read properties of undefined (reading 'length')" from
  // its own bundled code on every page in this Next.js version — unrelated to
  // app code (reproduces even on a stone-cold /login load with nothing else
  // interacted with). Disabling it stops the crash; real compile/runtime
  // errors still surface normally.
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
