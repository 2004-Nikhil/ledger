import type { Migration } from "./types";

export const migration009Investments: Migration = {
  id: 9,
  name: "investments_table",
  up: async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS investments (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('stock', 'mutual_fund', 'sip')),
        name TEXT NOT NULL,
        units REAL NOT NULL DEFAULT 0 CHECK (units >= 0),
        buy_price REAL NOT NULL DEFAULT 0 CHECK (buy_price >= 0),
        current_value REAL NOT NULL DEFAULT 0 CHECK (current_value >= 0),
        sip_amount REAL,
        sip_frequency TEXT CHECK (sip_frequency IN ('weekly', 'monthly', 'quarterly')),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
  },
};
