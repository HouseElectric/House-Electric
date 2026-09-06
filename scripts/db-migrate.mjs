import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const connectionString = process.env.connection_string;

if (!connectionString) {
  console.error("Missing `connection_string` in environment (.env).");
  process.exit(1);
}

const sql = readFileSync(path.join(__dirname, "..", "supabase", "schema.sql"), "utf8");

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query(sql);
  console.log("Schema applied successfully.");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
