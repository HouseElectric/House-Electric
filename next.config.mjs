/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Persistent filesystem cache has been failing to allocate memory on this
      // machine under low-RAM conditions — disable it so dev keeps working.
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
