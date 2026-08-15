import type { Migration } from "./types";

export const migration004TransactionAdjustments: Migration = {
  id: 4,
  name: "transaction_adjustments",
  up: async (db) => {
    // Nullable ADD COLUMN is the one schema change SQLite always allows
    // cleanly. A transaction with a non-null adjusts_transaction_id IS
    // the audit trail — it's a normal transaction row that also points
    // at the (locked) row it's correcting. Nothing about the original
    // row ever changes.
    await db.execAsync(`
      ALTER TABLE transactions ADD COLUMN adjusts_transaction_id TEXT REFERENCES transactions(id);
    `);
  },
};
