import fs from "fs";
import path from "path";

const ENV_LOCAL_PATH = path.join(process.cwd(), ".env.local");

/** Parse a .env file into a key-value map (skips comments and blanks) */
function parseEnvFile(content) {
  const entries = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    entries[key] = value;
  }
  return entries;
}

/** Serialize a key-value map back to .env format */
function serializeEnvFile(entries) {
  return Object.entries(entries)
    .map(([k, v]) => `${k}="${v}"`)
    .join("\n") + "\n";
}

/** Read .env.local (returns {} if it doesn't exist) */
export function readEnvLocal() {
  try {
    return parseEnvFile(fs.readFileSync(ENV_LOCAL_PATH, "utf8"));
  } catch {
    return {};
  }
}

/** Write / update keys in .env.local */
export function writeEnvLocal(updates) {
  const existing = readEnvLocal();
  const merged = { ...existing, ...updates };
  fs.writeFileSync(ENV_LOCAL_PATH, serializeEnvFile(merged), "utf8");
}

/** Detect DB type from a DATABASE_URL string */
export function detectDbType(url = "") {
  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) return "postgresql";
  if (url.startsWith("mysql://") || url.startsWith("mariadb://")) return "mariadb";
  return "sqlite";
}

/** Build a DATABASE_URL from structured fields */
export function buildDatabaseUrl(type, fields) {
  if (type === "sqlite") {
    return `file:${fields.filePath || "./prisma/dev.db"}`;
  }
  const { host, port, database, username, password } = fields;
  const protocol = type === "mariadb" ? "mysql" : "postgresql";
  const encodedPassword = encodeURIComponent(password || "");
  return `${protocol}://${username || ""}:${encodedPassword}@${host || "localhost"}:${port || (type === "mariadb" ? 3306 : 5432)}/${database || ""}`;
}

/** Parse a DATABASE_URL into structured fields */
export function parseDatabaseUrl(url = "") {
  const type = detectDbType(url);
  if (type === "sqlite") {
    return { type, filePath: url.replace(/^file:/, "") };
  }
  try {
    const u = new URL(url);
    return {
      type,
      host: u.hostname,
      port: u.port || (type === "mariadb" ? "3306" : "5432"),
      database: u.pathname.replace(/^\//, ""),
      username: u.username,
      password: decodeURIComponent(u.password),
    };
  } catch {
    return { type, host: "", port: "", database: "", username: "", password: "" };
  }
}
