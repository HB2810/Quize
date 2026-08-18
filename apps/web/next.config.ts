import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compile workspace packages consumed from source maps cleanly.
  transpilePackages: ["@stavya/contracts"],
};

export default nextConfig;
