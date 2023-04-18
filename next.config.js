/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
        util: require.resolve('util/'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
      };
    }
    return config;
  },
}

module.exports = nextConfig 