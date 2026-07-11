import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  webpack: (config) => {
    // jsmediatags references react-native-fs which isn't needed in browser
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-native-fs": false,
    };
    return config;
  },
};

export default nextConfig;
