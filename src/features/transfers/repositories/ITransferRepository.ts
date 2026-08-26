import type { Transfer } from "../types";

export interface CreateTransferRow {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  notes: string | null;
  createdAt: string;
}

export interface ITransferRepository {
  create(input: CreateTransferRow): Promise<Transfer>;
  findAll(): Promise<Transfer[]>;
  findById(id: string): Promise<Transfer | null>;
}
