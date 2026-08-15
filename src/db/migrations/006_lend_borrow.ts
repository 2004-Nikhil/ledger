import type { Migration } from "./types";

export const migration006LendBorrow: Migration = {
  id: 6,
  name: "lend_borrow_table",
  up: async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS lend_borrows (
        id TEXT PRIMARY KEY NOT NULL,
        person TEXT NOT NULL,
        amount REAL NOT NULL CHECK (amount > 0),
        date TEXT NOT NULL,
        direction TEXT NOT NULL CHECK (direction IN ('lent', 'borrowed')),
        account_id TEXT NOT NULL REFERENCES accounts(id),
        due_date TEXT,
        notes TEXT,
        paid_amount REAL NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
        status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid')),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_lend_borrows_account ON lend_borrows(account_id);
    `);
  },
};
