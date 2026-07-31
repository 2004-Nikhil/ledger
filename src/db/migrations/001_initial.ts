import type { Migration } from "./types";
export const migration001Initial: Migration = {
    id : 1,
    name : "initial schema",
    up: async (db)=>{
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS accounts (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('cash', 'card', 'bank')),
            opening_balance REAL NOT NULL DEFAULT 0,
            current_balance REAL NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
    `);
    },
};