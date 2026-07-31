import * as SQLite from "expo-sqlite";

const DB_NAME = "ledger.db";

/**
 * This is an infrastructure singleton, not application state — it just
 * holds the one open connection handle to the on-device SQLite file.
 * Nothing about *what the app is doing* lives here. Feature stores
 * (Zustand) hold app state; this only holds the DB handle.
 */
let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
    await dbInstance.execAsync("PRAGMA journal_mode = WAL;");
    await dbInstance.execAsync("PRAGMA foreign_keys = ON;");
  }
  return dbInstance;
}

export function __setDatabaseInstance(db: SQLite.SQLiteDatabase | null): void {
  dbInstance = db;
}
