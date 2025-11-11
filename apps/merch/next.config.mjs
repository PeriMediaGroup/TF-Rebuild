import path from "path";
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    nextScriptWorkers: false,
    disableNextJsDevtools: true,
  },
  webpack: (config) => {
    // tell webpack where to find @triggerfeed/theme
    config.resolve.alias["@triggerfeed/theme"] = path.resolve(__dirname, "../../packages/theme");
    return config;
  },
};

export default nextConfig;
