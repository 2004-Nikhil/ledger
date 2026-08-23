import type { Migration } from "./types";

export const migration010LendBorrowRepayments: Migration = {
  id: 10,
  name: "lend_borrow_repayments_table",
  up: async (db) => {
    // currently we ever stored the running paid_amount/status on the
    // lend_borrows row itself — correct for "how much is left to repay"
    // but it throws away *when* each repayment happened. now
    // balance trend needs to reconstruct historical totals, which is
    // only possible if every balance-affecting event has a date. This
    // table is that missing history; lend_borrows.paid_amount/status
    // stay as the fast-read cache of "current state".
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS lend_borrow_repayments (
        id TEXT PRIMARY KEY NOT NULL,
        lend_borrow_id TEXT NOT NULL REFERENCES lend_borrows(id),
        amount REAL NOT NULL CHECK (amount > 0),
        date TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_lend_borrow_repayments_parent ON lend_borrow_repayments(lend_borrow_id);
    `);
  },
};
