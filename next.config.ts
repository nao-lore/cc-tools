import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Redirect old cc-tools.vercel.app to tools.loresync.dev
      {
        source: "/:path*",
        has: [{ type: "host", value: "cc-tools.vercel.app" }],
        destination: "https://tools.loresync.dev/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
