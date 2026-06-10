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
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-better-sqlite3", "better-sqlite3", "@prisma/adapter-pg", "pg", "bcryptjs", "@anthropic-ai/sdk", "openai", "pdf-parse", "mammoth", "pdfkit"],
  productionBrowserSourceMaps: true,

  // Security headers on every response (incl. public pages, which the auth
  // middleware matcher does not cover).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // HSTS — only effective over HTTPS; harmless over HTTP in dev
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Conservative CSP that cannot break Next's inline scripts:
          // clickjacking, plugin and base-tag protection only.
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
