import type { SQLiteDatabase } from "expo-sqlite";
import type { ITransactionRepository, CreateTransactionRow } from "./ITransactionRepository";
import type { Transaction } from "../types";

interface TransactionRow {
  id: string;
  name: string;
  amount: number;
  date: string;
  category_id: string;
  account_id: string;
  type: Transaction["type"];
  notes: string | null;
  locked_until: string;
  created_at: string;
  adjusts_transaction_id: string | null;
}

function mapRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    date: row.date,
    categoryId: row.category_id,
    accountId: row.account_id,
    type: row.type,
    notes: row.notes,
    lockedUntil: row.locked_until,
    createdAt: row.created_at,
    adjustsTransactionId: row.adjusts_transaction_id,
  };
}

export class SqliteTransactionRepository implements ITransactionRepository {
  constructor(private db: SQLiteDatabase) {}

  async create(input: CreateTransactionRow): Promise<Transaction> {
    await this.db.runAsync(
      `INSERT INTO transactions
         (id, name, amount, date, category_id, account_id, type, notes, locked_until, created_at, adjusts_transaction_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        input.id,
        input.name,
        input.amount,
        input.date,
        input.categoryId,
        input.accountId,
        input.type,
        input.notes,
        input.lockedUntil,
        input.createdAt,
        input.adjustsTransactionId,
      ]
    );

    return {
      id: input.id,
      name: input.name,
      amount: input.amount,
      date: input.date,
      categoryId: input.categoryId,
      accountId: input.accountId,
      type: input.type,
      notes: input.notes,
      lockedUntil: input.lockedUntil,
      createdAt: input.createdAt,
      adjustsTransactionId: input.adjustsTransactionId,
    };
  }

  async findAll(): Promise<Transaction[]> {
    const rows = await this.db.getAllAsync<TransactionRow>(
      "SELECT * FROM transactions ORDER BY date DESC, created_at DESC;"
    );
    return rows.map(mapRow);
  }

  async findById(id: string): Promise<Transaction | null> {
    const row = await this.db.getFirstAsync<TransactionRow>(
      "SELECT * FROM transactions WHERE id = ?;",
      [id]
    );
    return row ? mapRow(row) : null;
  }
}
