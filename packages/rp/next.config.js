module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback['react-native-sqlite-storage'] = false;
      config.resolve.fallback.fs = false;
      config.resolve.fallback.net = false;
      config.resolve.fallback.dns = false;
      config.resolve.fallback.tls = false;
      config.resolve.fallback.module = false;
      config.resolve.fallback.child_process = false;
    }
    config.ignoreWarnings = [/critical dependency:/i];
    return config;
  },
  images: {
    domains: ['api.qrserver.com'],
  },
};
