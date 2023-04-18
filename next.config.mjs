/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'ui-avatars.com',
    ],
  },
  experimental: {
    serverActions: true,
  },
};

export default nextConfig;
