import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for @react-pdf/renderer to work in API routes
  serverExternalPackages: ['@react-pdf/renderer'],
  
  // Empty turbopack config to silence warning
  turbopack: {},
};

export default nextConfig;
