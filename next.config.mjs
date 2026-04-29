import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-better-sqlite3", "better-sqlite3", "bcryptjs", "@anthropic-ai/sdk", "openai", "pdf-parse", "mammoth"],
  productionBrowserSourceMaps: true,
};

export default withNextIntl(nextConfig);
