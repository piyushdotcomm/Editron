import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  // Enable gzip compression for all responses
  compress: true,
  // Allow a custom build output directory via NEXT_DIST_DIR for bundle analysis or other build workflows.
  distDir: process.env.NEXT_DIST_DIR || ".next",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
        pathname: "/**",
      },
    ],
  },

  // Performance: tree-shake icon/utility libraries (only bundle used exports)
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "date-fns",
    ],
  },

  // Keep server-only packages out of client bundles
  serverExternalPackages: ["@prisma/client", "prisma"],

  async rewrites() {
    return [
      {
        source: "/api/collab/:path*",
        // Proxy WebSocket connections to our standalone collab server
        destination: "http://localhost:1234/:path*",
      },
    ];
  },

  async headers() {
    return [
      // Security + COOP/COEP headers for all routes
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
          // Security headers (improves Pingdom grade)
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Signal compression support
          {
            key: "Vary",
            value: "Accept-Encoding",
          },
        ],
      },
      // Long cache for static assets (SVGs, images, fonts)
      {
        source: "/:file(.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|.*\\.ico|.*\\.woff2?)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  reactStrictMode: false,
  outputFileTracingRoot: process.cwd(),

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingIncludes: {
    '/api/template/**/*': ['./editron-starters/**/*'],
  },
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

export default withBundleAnalyzer(nextConfig);
