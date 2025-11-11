import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
