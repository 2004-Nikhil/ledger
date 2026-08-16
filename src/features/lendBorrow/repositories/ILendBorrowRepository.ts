import type { LendBorrow } from "../types";

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

export interface ILendBorrowRepository {
  create(input: CreateLendBorrowRow): Promise<LendBorrow>;
  findAll(): Promise<LendBorrow[]>;
  findById(id: string): Promise<LendBorrow | null>;
  /** Sets the new paid_amount and derived status in one write. */
  updateRepayment(id: string, paidAmount: number, status: LendBorrow["status"]): Promise<void>;
}
