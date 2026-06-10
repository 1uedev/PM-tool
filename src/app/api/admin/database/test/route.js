import { requireAdmin } from "@/lib/middleware/auth-guard.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import { validateDatabaseUrl } from "@/lib/env-config.js";

async function testSqlite(url) {
  const filePath = url.replace(/^file:/, "");
  // For SQLite we just verify the path is writable/readable
  const { default: fs } = await import("fs");
  const { default: path } = await import("path");
  const { default: process } = await import("process");
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  const dir = path.dirname(abs);
  try {
    fs.accessSync(dir, fs.constants.W_OK);
    return { ok: true, message: `SQLite-Pfad erreichbar: ${abs}` };
  } catch {
    return { ok: false, message: `Verzeichnis nicht beschreibbar: ${dir}` };
  }
}

async function testPostgres(url) {
  const { default: pg } = await import("pg");
  const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    const res = await client.query("SELECT version()");
    await client.end();
    return { ok: true, message: res.rows[0].version.split(",")[0] };
  } catch (e) {
    return { ok: false, message: e.message };
  }
}

async function testMariadb(url) {
  const mysql = await import("mysql2/promise");
  let connection;
  try {
    connection = await mysql.default.createConnection({ uri: url, connectTimeout: 5000 });
    const [rows] = await connection.execute("SELECT VERSION() AS v");
    return { ok: true, message: `MariaDB/MySQL ${rows[0].v}` };
  } catch (e) {
    return { ok: false, message: e.message };
  } finally {
    if (connection) await connection.end().catch(() => {});
  }
}

// POST /api/admin/database/test — test a connection URL
export async function POST(request) {
  const { response: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const { url } = await request.json();
  if (!url) return errorResponse("VALIDATION_ERROR", "url ist erforderlich", 400);

  const validation = validateDatabaseUrl(url);
  if (!validation.ok) {
    return errorResponse("VALIDATION_ERROR", validation.message, 400);
  }

  const type = validation.type;
  let result;

  try {
    if (type === "sqlite") result = await testSqlite(url);
    else if (type === "postgresql") result = await testPostgres(url);
    else if (type === "mariadb") result = await testMariadb(url);
    else result = { ok: false, message: `Unbekannter DB-Typ: ${type}` };
  } catch (e) {
    result = { ok: false, message: e.message };
  }

  return successResponse({ ...result, type });
}
