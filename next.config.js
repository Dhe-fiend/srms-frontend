/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://srms-backend-hvrp.onrender.com/api/:path*",
      },
    ];
  },
};
module.exports = nextConfig;
