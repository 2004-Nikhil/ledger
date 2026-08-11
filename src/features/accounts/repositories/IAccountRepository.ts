import type { Account } from "../types";

export interface CreateAccountRow {
  id: string;
  name: string;
  type: Account["type"];
  openingBalance: number;
  createdAt: string;
}

export interface IAccountRepository {
  create(input: CreateAccountRow): Promise<Account>;
  findAll(): Promise<Account[]>;
  findById(id: string): Promise<Account | null>;
  /** Applies a signed delta to current_balance — positive credits, negative debits. */
  adjustBalance(accountId: string, delta: number): Promise<void>;
}
