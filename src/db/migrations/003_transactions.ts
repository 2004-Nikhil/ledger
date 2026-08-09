import type { Migration } from "./types";

export const migration003Transactions: Migration = {
  id: 3,
  name: "transactions_table",
  up: async (db) => {
    // `type` intentionally has no CHECK constraint here — Phase 2 adds
    // 'transfer' and 'lend'/'borrow' values, and SQLite can't cleanly
    // ALTER a CHECK constraint later. The allowed values are validated
    // in TransactionService instead, where business rules belong.
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        amount REAL NOT NULL CHECK (amount > 0),
        date TEXT NOT NULL,
        category_id TEXT NOT NULL REFERENCES categories(id),
        account_id TEXT NOT NULL REFERENCES accounts(id),
        type TEXT NOT NULL,
        notes TEXT,
        locked_until TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    `);
  },
};
