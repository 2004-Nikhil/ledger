export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  categoryId: string;
  accountId: string;
  type: TransactionType;
  notes: string | null;
  lockedUntil: string;
  createdAt: string;
}

export interface CreateTransactionRequest {
  name: string;
  amount: number;
  date: string;
  categoryId: string;
  accountId: string;
  type: TransactionType;
  notes?: string;
}
