import type { Migration } from "./types";

export const migration008Goals: Migration = {
  id: 8,
  name: "goals_tables",
  up: async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        required_amount REAL NOT NULL CHECK (required_amount > 0),
        accumulated_amount REAL NOT NULL DEFAULT 0 CHECK (accumulated_amount >= 0),
        target_date TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS goal_contributions (
        id TEXT PRIMARY KEY NOT NULL,
        goal_id TEXT NOT NULL REFERENCES goals(id),
        account_id TEXT NOT NULL REFERENCES accounts(id),
        amount REAL NOT NULL CHECK (amount > 0),
        date TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_goal_contributions_goal ON goal_contributions(goal_id);
    `);
  },
};
