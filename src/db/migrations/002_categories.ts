import type { Migration } from "./types";
import { DEFAULT_CATEGORIES } from "@/constants/categories";

export const migration002Categories: Migration = {
  id: 2,
  name: "categories_table",
  up: async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        is_custom INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // Seed the defaults once. INSERT OR IGNORE means re-running this on
    // an existing device (or a future app version) never duplicates rows.
    for (const category of DEFAULT_CATEGORIES) {
      await db.runAsync(
        "INSERT OR IGNORE INTO categories (id, name, type, is_custom) VALUES (?, ?, ?, 0);",
        [category.id, category.name, category.type]
      );
    }
  },
};