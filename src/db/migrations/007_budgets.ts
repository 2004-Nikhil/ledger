import type { Migration } from "./types";

export const migration007Budgets: Migration = {
  id: 7,
  name: "budgets_table",
  up: async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY NOT NULL,
        category_id TEXT NOT NULL REFERENCES categories(id),
        month TEXT NOT NULL,
        allotted_amount REAL NOT NULL CHECK (allotted_amount >= 0),
        rollover_enabled INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE (category_id, month)
      );

      CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
    `);
  },
};
