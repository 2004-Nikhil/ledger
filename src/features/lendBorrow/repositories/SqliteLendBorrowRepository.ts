import type { SQLiteDatabase } from "expo-sqlite";
import type { ILendBorrowRepository, CreateLendBorrowRow, CreateRepaymentRow } from "./ILendBorrowRepository";
import type { LendBorrow, LendBorrowRepaymentRecord } from "../types";

interface LendBorrowRow {
  id: string;
  person: string;
  amount: number;
  date: string;
  direction: LendBorrow["direction"];
  account_id: string;
  due_date: string | null;
  notes: string | null;
  paid_amount: number;
  status: LendBorrow["status"];
  created_at: string;
}

interface RepaymentRow {
  id: string;
  lend_borrow_id: string;
  amount: number;
  date: string;
  created_at: string;
}

function mapRow(row: LendBorrowRow): LendBorrow {
  return {
    id: row.id,
    person: row.person,
    amount: row.amount,
    date: row.date,
    direction: row.direction,
    accountId: row.account_id,
    dueDate: row.due_date,
    notes: row.notes,
    paidAmount: row.paid_amount,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapRepaymentRow(row: RepaymentRow): LendBorrowRepaymentRecord {
  return {
    id: row.id,
    lendBorrowId: row.lend_borrow_id,
    amount: row.amount,
    date: row.date,
    createdAt: row.created_at,
  };
}

export class SqliteLendBorrowRepository implements ILendBorrowRepository {
  constructor(private db: SQLiteDatabase) {}

  async create(input: CreateLendBorrowRow): Promise<LendBorrow> {
    await this.db.runAsync(
      `INSERT INTO lend_borrows
         (id, person, amount, date, direction, account_id, due_date, notes, paid_amount, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'unpaid', ?);`,
      [
        input.id,
        input.person,
        input.amount,
        input.date,
        input.direction,
        input.accountId,
        input.dueDate,
        input.notes,
        input.createdAt,
      ]
    );

    return {
      id: input.id,
      person: input.person,
      amount: input.amount,
      date: input.date,
      direction: input.direction,
      accountId: input.accountId,
      dueDate: input.dueDate,
      notes: input.notes,
      paidAmount: 0,
      status: "unpaid",
      createdAt: input.createdAt,
    };
  }

  async findAll(): Promise<LendBorrow[]> {
    const rows = await this.db.getAllAsync<LendBorrowRow>(
      "SELECT * FROM lend_borrows ORDER BY status ASC, due_date IS NULL, due_date ASC, date DESC;"
    );
    return rows.map(mapRow);
  }

  async findById(id: string): Promise<LendBorrow | null> {
    const row = await this.db.getFirstAsync<LendBorrowRow>(
      "SELECT * FROM lend_borrows WHERE id = ?;",
      [id]
    );
    return row ? mapRow(row) : null;
  }

  async updateRepayment(id: string, paidAmount: number, status: LendBorrow["status"]): Promise<void> {
    await this.db.runAsync(
      "UPDATE lend_borrows SET paid_amount = ?, status = ? WHERE id = ?;",
      [paidAmount, status, id]
    );
  }

  async createRepaymentRecord(input: CreateRepaymentRow): Promise<LendBorrowRepaymentRecord> {
    await this.db.runAsync(
      "INSERT INTO lend_borrow_repayments (id, lend_borrow_id, amount, date, created_at) VALUES (?, ?, ?, ?, ?);",
      [input.id, input.lendBorrowId, input.amount, input.date, input.createdAt]
    );
    return { ...input };
  }

  async findAllRepayments(): Promise<LendBorrowRepaymentRecord[]> {
    const rows = await this.db.getAllAsync<RepaymentRow>("SELECT * FROM lend_borrow_repayments;");
    return rows.map(mapRepaymentRow);
  }
}
