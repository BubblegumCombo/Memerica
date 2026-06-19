import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. A stray lockfile in a parent
  // directory otherwise makes Next infer the wrong root for file tracing.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
