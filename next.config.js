/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    EMBY_SERVER_URL: process.env.EMBY_SERVER_URL,
    EMBY_API_KEY: process.env.EMBY_API_KEY,
  },
  images: {
    domains: ['167.172.75.130'],
  },
  experimental: {
    serverActions: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // Add transpilation for problematic node_modules
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/undici/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-proposal-private-methods']
        }
      }
    });

    return config;
  },
};

module.exports = nextConfig;