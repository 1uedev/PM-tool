import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis;

// Pick the driver adapter from the DATABASE_URL scheme so the same build
// runs against SQLite (default) or PostgreSQL without code changes.
function createAdapter(url) {
  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
    return new PrismaPg(new Pool({ connectionString: url }));
  }
  if (url.startsWith("mysql://") || url.startsWith("mariadb://")) {
    throw new Error(
      "MariaDB/MySQL DATABASE_URL configured, but no driver adapter is installed. " +
      "Install @prisma/adapter-mariadb and wire it up in src/lib/prisma.js, or use SQLite/PostgreSQL."
    );
  }
  return new PrismaBetterSqlite3({ url });
}

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  return new PrismaClient({ adapter: createAdapter(url) });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
