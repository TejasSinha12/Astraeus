import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* Production Optimizations */
    reactStrictMode: true,
    poweredByHeader: false,
    compiler: {
        removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
    },
    transpilePackages: ["lucide-react"],
};

export default nextConfig;
