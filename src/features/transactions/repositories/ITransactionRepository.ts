import type { Transaction } from "../types";

export interface CreateTransactionRow {
  id: string;
  name: string;
  amount: number;
  date: string;
  categoryId: string;
  accountId: string;
  type: Transaction["type"];
  notes: string | null;
  lockedUntil: string;
  createdAt: string;
  adjustsTransactionId: string | null;
}

export interface ITransactionRepository {
  create(input: CreateTransactionRow): Promise<Transaction>;
  findAll(): Promise<Transaction[]>;
  findById(id: string): Promise<Transaction | null>;
}
