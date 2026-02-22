/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['gateway.lighthouse.storage', 'ipfs.io'],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  env: {
    NEXT_PUBLIC_FLOW_NETWORK: process.env.NEXT_PUBLIC_FLOW_NETWORK,
    NEXT_PUBLIC_FLOW_ACCESS_NODE: process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE,
  },
};

module.exports = nextConfig;
