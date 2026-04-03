import { createHash } from "node:crypto";
import fs from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import postgres from "postgres";
import {
  applyPendingMigrations,
  inspectMigrations,
} from "./client.js";
import {
  getEmbeddedPostgresTestSupport,
  startEmbeddedPostgresTestDatabase,
} from "./test-embedded-postgres.js";

const cleanups: Array<() => Promise<void>> = [];
const embeddedPostgresSupport = await getEmbeddedPostgresTestSupport();
const describeEmbeddedPostgres = embeddedPostgresSupport.supported ? describe : describe.skip;

async function createTempDatabase(): Promise<string> {
  const db = await startEmbeddedPostgresTestDatabase("agilo-db-client-");
  cleanups.push(db.cleanup);
  return db.connectionString;
}

async function migrationHash(migrationFile: string): Promise<string> {
  const content = await fs.promises.readFile(
    new URL(`./migrations/${migrationFile}`, import.meta.url),
    "utf8",
  );
  return createHash("sha256").update(content).digest("hex");
}

afterEach(async () => {
  while (cleanups.length > 0) {
    const cleanup = cleanups.pop();
    await cleanup?.();
  }
});

if (!embeddedPostgresSupport.supported) {
  console.warn(
    `Skipping embedded Postgres migration tests on this host: ${embeddedPostgresSupport.reason ?? "unsupported environment"}`,
  );
}

describeEmbeddedPostgres("applyPendingMigrations", () => {
  it(
    "re-applies a later migration when its journal row is removed and schema drifted",
    async () => {
      const connectionString = await createTempDatabase();

      await applyPendingMigrations(connectionString);

      const sql = postgres(connectionString, { max: 1, onnotice: () => {} });
      try {
        const laterHash = await migrationHash("0001_tiresome_lord_tyger.sql");

        await sql.unsafe(
          `DELETE FROM "drizzle"."__drizzle_migrations" WHERE hash = '${laterHash}'`,
        );
        await sql.unsafe(
          `ALTER TABLE "companies" ALTER COLUMN "issue_prefix" SET DEFAULT 'WRONG'`,
        );
      } finally {
        await sql.end();
      }

      const pendingState = await inspectMigrations(connectionString);
      expect(pendingState).toMatchObject({
        status: "needsMigrations",
        pendingMigrations: ["0001_tiresome_lord_tyger.sql"],
        reason: "pending-migrations",
      });

      await applyPendingMigrations(connectionString);

      const finalState = await inspectMigrations(connectionString);
      expect(finalState.status).toBe("upToDate");

      const verifySql = postgres(connectionString, { max: 1, onnotice: () => {} });
      try {
        const rows = await verifySql.unsafe<{ column_default: string | null }[]>(
          `
            SELECT column_default
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'companies'
              AND column_name = 'issue_prefix'
          `,
        );
        expect(rows).toHaveLength(1);
        expect(rows[0]?.column_default).toContain("AGILO");
      } finally {
        await verifySql.end();
      }
    },
    20_000,
  );

  it(
    "replays a later migration safely when its schema changes already exist",
    async () => {
      const connectionString = await createTempDatabase();

      await applyPendingMigrations(connectionString);

      const sql = postgres(connectionString, { max: 1, onnotice: () => {} });
      try {
        const laterHash = await migrationHash("0001_tiresome_lord_tyger.sql");

        await sql.unsafe(
          `DELETE FROM "drizzle"."__drizzle_migrations" WHERE hash = '${laterHash}'`,
        );

        const rows = await sql.unsafe<{ column_default: string | null }[]>(
          `
            SELECT column_default
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'companies'
              AND column_name = 'issue_prefix'
          `,
        );
        expect(rows).toHaveLength(1);
        expect(rows[0]?.column_default).toContain("AGILO");
      } finally {
        await sql.end();
      }

      const pendingState = await inspectMigrations(connectionString);
      expect(pendingState).toMatchObject({
        status: "needsMigrations",
        pendingMigrations: ["0001_tiresome_lord_tyger.sql"],
        reason: "pending-migrations",
      });

      await applyPendingMigrations(connectionString);

      const finalState = await inspectMigrations(connectionString);
      expect(finalState.status).toBe("upToDate");
    },
    20_000,
  );

  it(
    "enforces a unique board_api_keys.key_hash",
    async () => {
      const connectionString = await createTempDatabase();

      await applyPendingMigrations(connectionString);

      const sql = postgres(connectionString, { max: 1, onnotice: () => {} });
      try {
        await sql.unsafe(`
          INSERT INTO "user" ("id", "name", "email", "email_verified", "created_at", "updated_at")
          VALUES ('user-1', 'User One', 'user@example.com', true, now(), now())
        `);
        await sql.unsafe(`
          INSERT INTO "board_api_keys" ("id", "user_id", "name", "key_hash", "created_at")
          VALUES ('00000000-0000-0000-0000-000000000001', 'user-1', 'Key One', 'dup-hash', now())
        `);
        await expect(
          sql.unsafe(`
            INSERT INTO "board_api_keys" ("id", "user_id", "name", "key_hash", "created_at")
            VALUES ('00000000-0000-0000-0000-000000000002', 'user-1', 'Key Two', 'dup-hash', now())
          `),
        ).rejects.toThrow();
      } finally {
        await sql.end();
      }
    },
    20_000,
  );
});
