/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.simplehash.com',
        port: '',
        pathname: '/assets/**',
        search: '',
      },
    ],
  }
};

export default nextConfig;
