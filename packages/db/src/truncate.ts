import { createDb } from "./client.js";
import { sql } from "drizzle-orm";

const url = process.env.DATABASE_URL || "postgres://agilo:agilo@127.0.0.1:54329/agilo";

const db = createDb(url);

async function truncateAll() {
  console.log("Truncating all tables...");
  
  // Get all table names in the public schema
  const tables = await db.execute<{ tablename: string }>(sql`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' AND tablename != 'drizzle_migrations';
  `);

  if (tables.length === 0) {
    console.log("No tables to truncate.");
    return;
  }

  const tableNames = tables.map(t => `"${t.tablename}"`).join(", ");
  
  // Truncate all tables and cascade to handle foreign keys
  await db.execute(sql.raw(`TRUNCATE TABLE ${tableNames} CASCADE;`));
  
  console.log("Truncated tables:", tables.map(t => t.tablename).join(", "));
  
  // Re-seed the global company since it's required for the app to function
  console.log("Re-seeding global company...");
  await db.execute(sql`
    INSERT INTO "companies" ("id", "name", "status", "issue_prefix", "issue_counter", "budget_monthly_cents", "spent_monthly_cents", "created_at", "updated_at")
    VALUES ('00000000-0000-0000-0000-000000000000', 'Global', 'active', 'AGILO', 0, 0, 0, now(), now())
    ON CONFLICT ("id") DO NOTHING;
  `);
  
  console.log("Truncate and re-seed complete.");
  process.exit(0);
}

truncateAll().catch((err) => {
  console.error("Failed to truncate:", err);
  process.exit(1);
});
