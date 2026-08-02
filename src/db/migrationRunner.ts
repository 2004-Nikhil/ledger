import type { SQLiteDatabase } from "expo-sqlite";
import type { Migration } from "./migrations/types";

const CREATE_TRACKING_TABLE = `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

/**
 * Runs any migration whose id isn't yet in schema_migrations, in ascending
 * id order, and records it once it succeeds. Safe to call on every app
 * start — already-applied migrations are skipped.
 */
export async function runMigrations(db: SQLiteDatabase, allMigrations: Migration[]): Promise<void> {
  await db.execAsync(CREATE_TRACKING_TABLE);

  const appliedRows = await db.getAllAsync<{ id: number }>(
    "SELECT id FROM schema_migrations ORDER BY id ASC;"
  );
  const appliedIds = new Set(appliedRows.map((row) => row.id));

  const pending = allMigrations
    .filter((migration) => !appliedIds.has(migration.id))
    .sort((a, b) => a.id - b.id);

  for (const migration of pending) {
    await migration.up(db);
    await db.runAsync(
      "INSERT INTO schema_migrations (id, name) VALUES (?, ?);",
      [migration.id, migration.name]
    );
  }
}
