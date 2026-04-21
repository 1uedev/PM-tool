/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-better-sqlite3", "better-sqlite3", "bcryptjs", "@anthropic-ai/sdk"],
  productionBrowserSourceMaps: true,
};

export default nextConfig;
