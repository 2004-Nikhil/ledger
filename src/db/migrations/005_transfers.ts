import type { Migration } from "./types";

export const migration005Transfers: Migration = {
  id: 5,
  name: "transfers_table",
  up: async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transfers (
        id TEXT PRIMARY KEY NOT NULL,
        from_account_id TEXT NOT NULL REFERENCES accounts(id),
        to_account_id TEXT NOT NULL REFERENCES accounts(id),
        amount REAL NOT NULL CHECK (amount > 0),
        date TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_transfers_from ON transfers(from_account_id);
      CREATE INDEX IF NOT EXISTS idx_transfers_to ON transfers(to_account_id);
    `);
  },
};
