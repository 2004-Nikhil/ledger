import type { SQLiteDatabase } from "expo-sqlite";
import type { ITransferRepository, CreateTransferRow } from "./ITransferRepository";
import type { Transfer } from "../types";

interface TransferRow {
  id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  date: string;
  notes: string | null;
  created_at: string;
}

function mapRow(row: TransferRow): Transfer {
  return {
    id: row.id,
    fromAccountId: row.from_account_id,
    toAccountId: row.to_account_id,
    amount: row.amount,
    date: row.date,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export class SqliteTransferRepository implements ITransferRepository {
  constructor(private db: SQLiteDatabase) {}

  async create(input: CreateTransferRow): Promise<Transfer> {
    await this.db.runAsync(
      `INSERT INTO transfers (id, from_account_id, to_account_id, amount, date, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [input.id, input.fromAccountId, input.toAccountId, input.amount, input.date, input.notes, input.createdAt]
    );
    return { ...input };
  }

  async findAll(): Promise<Transfer[]> {
    const rows = await this.db.getAllAsync<TransferRow>(
      "SELECT * FROM transfers ORDER BY date DESC, created_at DESC;"
    );
    return rows.map(mapRow);
  }

  async findById(id: string): Promise<Transfer | null> {
    const row = await this.db.getFirstAsync<TransferRow>("SELECT * FROM transfers WHERE id = ?;", [id]);
    return row ? mapRow(row) : null;
  }
}
