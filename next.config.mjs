/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // lucide-react's icon barrel file (components/icons.jsx re-exports ~60 icons
    // from it) forces webpack to resolve the whole package graph on every route
    // that imports it in dev mode. This rewrites those imports to per-icon
    // modules automatically, which is the officially recommended fix and doesn't
    // add any memory overhead (the opposite of the filesystem-cache tradeoff below).
    optimizePackageImports: ["lucide-react"],
  },
  async redirects() {
    return [
      // The generic services template and /amc/plans used to duplicate the same AMC content —
      // /amc/plans is now the single canonical AMC page (pricing, comparison, T&C included).
      {
        source: "/services/annual-maintenance-contract-amc",
        destination: "/amc/plans",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Persistent filesystem cache previously OOM'd on this machine under
      // low-RAM conditions. Keep it on (it's the main lever for dev speed —
      // without it, every route recompiles from scratch every time) but cap
      // how many old cache generations webpack keeps in memory before writing
      // them to disk, to lower peak memory during that write. If this still
      // crashes, set `config.cache = false;` again.
      config.cache = {
        type: "filesystem",
        maxMemoryGenerations: 1,
      };
    }
    return config;
  },
};

export default nextConfig;
