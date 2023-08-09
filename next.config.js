const isProd = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  assetPrefix: isProd ? "https://nutuk.vercel.app/" : undefined,
};

module.exports = nextConfig;
