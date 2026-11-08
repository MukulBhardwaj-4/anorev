import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary delivery domains used by next-cloudinary's CldImage/CldVideoPlayer
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "res-*.cloudinary.com" },
    ],
  },
};

export default nextConfig;
