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

/**
 * Reject keys/values that would break out of the quoted .env format.
 * A value containing a quote + newline could otherwise inject or
 * overwrite arbitrary env vars (e.g. NEXTAUTH_SECRET).
 */
function assertSafeEnvEntry(key, value) {
  if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
    throw new Error(`Unsafe env key: ${key}`);
  }
  // eslint-disable-next-line no-control-regex
  if (/["\n\r\x00-\x1f]/.test(value)) {
    throw new Error(`Unsafe env value for ${key}: quotes and control characters are not allowed`);
  }
}

/** Serialize a key-value map back to .env format */
function serializeEnvFile(entries) {
  return Object.entries(entries)
    .map(([k, v]) => {
      assertSafeEnvEntry(k, String(v));
      return `${k}="${v}"`;
    })
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

/**
 * Strictly validate a DATABASE_URL before it is persisted or used to open
 * a connection. Returns { ok, type } or { ok: false, message }.
 */
export function validateDatabaseUrl(url) {
  if (typeof url !== "string" || !url.trim()) {
    return { ok: false, message: "URL fehlt" };
  }
  if (url.length > 500) {
    return { ok: false, message: "URL ist zu lang (max. 500 Zeichen)" };
  }
  // eslint-disable-next-line no-control-regex
  if (/["'\s\x00-\x1f]/.test(url)) {
    return { ok: false, message: "URL enthält unzulässige Zeichen (Anführungszeichen, Leerzeichen oder Steuerzeichen)" };
  }

  const type = detectDbType(url);

  if (type === "sqlite") {
    if (!/^file:[A-Za-z0-9._~/-]+$/.test(url)) {
      return { ok: false, message: "SQLite-URLs müssen die Form file:./pfad/zur/datei.db haben" };
    }
    return { ok: true, type };
  }

  try {
    const parsed = new URL(url);
    if (!parsed.hostname) {
      return { ok: false, message: "Verbindungs-URL enthält keinen Host" };
    }
  } catch {
    return { ok: false, message: "Ungültige Verbindungs-URL" };
  }
  return { ok: true, type };
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
