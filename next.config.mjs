import createNextIntlPlugin from "next-intl/plugin";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly set project root so Next.js doesn't pick up stray lockfiles
  // in parent directories and misidentify the workspace root.
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-better-sqlite3", "better-sqlite3", "bcryptjs", "@anthropic-ai/sdk", "openai", "pdf-parse", "mammoth", "pdfkit"],
  productionBrowserSourceMaps: true,
};

export default withNextIntl(nextConfig);
