/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  assetPrefix: "https://nutuk.vercel.app/",
};

module.exports = nextConfig;
