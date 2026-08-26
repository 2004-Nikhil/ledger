import type { LendBorrow, LendBorrowRepaymentRecord } from "../types";

export interface CreateLendBorrowRow {
  id: string;
  person: string;
  amount: number;
  date: string;
  direction: LendBorrow["direction"];
  accountId: string;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateRepaymentRow {
  id: string;
  lendBorrowId: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface ILendBorrowRepository {
  create(input: CreateLendBorrowRow): Promise<LendBorrow>;
  findAll(): Promise<LendBorrow[]>;
  findById(id: string): Promise<LendBorrow | null>;
  /** Sets the new paid_amount and derived status in one write — the fast-read cache of "current state". */
  updateRepayment(id: string, paidAmount: number, status: LendBorrow["status"]): Promise<void>;
  /** The dated audit trail a repayment leaves behind — needed to reconstruct historical balances. */
  createRepaymentRecord(input: CreateRepaymentRow): Promise<LendBorrowRepaymentRecord>;
  findAllRepayments(): Promise<LendBorrowRepaymentRecord[]>;
  findRepaymentById(id: string): Promise<LendBorrowRepaymentRecord | null>;
}
