import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable experimental features that cause TensorFlow.js compatibility issues
  webpack: (config, { isServer }) => {
    // TensorFlow.js configuration for server-side
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "@tensorflow/tfjs-node": "commonjs @tensorflow/tfjs-node",
      });
    }

    // Ignore .node files in client bundle
    config.module.rules.push({
      test: /\.node$/,
      use: "ignore-loader",
    });

    return config;
  },
};

export default nextConfig;
