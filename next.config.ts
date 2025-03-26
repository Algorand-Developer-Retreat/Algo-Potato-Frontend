import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  webpack: (config) => {
    config.resolve.alias["@algorandfoundation/liquid-auth-use-wallet-client"] = false;
    config.resolve.alias["@perawallet/connect-beta"] = false;
    config.resolve.alias["@agoralabs-sh/avm-web-provider"] = false;
    config.externals.push("pino-pretty");
    return config;
  },
  images: {
    domains: ["f005.backblazeb2.com"],
  },
};

export default nextConfig;
