/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    nextScriptWorkers: false,
    // 👇 this is the real one that kills the new badge
    disableNextJsDevtools: true,
  },
};

export default nextConfig;
