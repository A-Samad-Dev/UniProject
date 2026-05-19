import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["localhost", "res.cloudinary.com"],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
