/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_BUILD_DIR || '.next',
  outputFileTracing: false,
  webpack: (config, { isServer }) => {
    if (isServer) config.externals.push({ 'node:sqlite': 'commonjs node:sqlite' });
    return config;
  },
};

export default nextConfig;
