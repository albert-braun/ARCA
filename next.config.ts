import type { NextConfig } from "next";
import path from "node:path";

const pages = process.env.GITHUB_PAGES === "true";
const basePath = pages ? "/ARCA" : "";

const nextConfig: NextConfig = {
  ...(pages ? { output: "export" as const, basePath, trailingSlash: true } : {}),
  outputFileTracingRoot: path.join(process.cwd()),
  poweredByHeader: false,
  images: {
    unoptimized: pages,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fakestoreapi.com",
        pathname: "/img/**",
      },
    ],
  },
};

export default nextConfig;
