// This is needed just to refresh the build during package development
// and can be safely removed in your project.
const withTM = require('next-transpile-modules')(['next-cookbook']);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // This is needed just to refresh the build during package development
    // and can be safely removed in your project.
    config.snapshot = {
      ...(config.snapshot ?? {}),
      managedPaths: [/^(.+?[\\/]node_modules[\\/])(?!@next-cookbook)/],
    };

    config.watchOptions = {
      ...(config.watchOptions ?? {}),
      ignored: [
        '**/.git/**',
        '**/node_modules/!(next-cookbook)**',
        '**/.next/**',
      ],
    };

    return config;
  },
};

module.exports = withTM(nextConfig);
