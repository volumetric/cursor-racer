/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      phaser: 'phaser/dist/phaser.js',
    };
    return config;
  },
};

export default nextConfig;
