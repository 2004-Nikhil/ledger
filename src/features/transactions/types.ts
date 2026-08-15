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
  /** Non-null on an adjustment row: the id of the (locked) transaction it corrects. */
  adjustsTransactionId: string | null;
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

export interface CreateAdjustmentRequest {
  /** The locked transaction this adjustment corrects. */
  originalTransactionId: string;
  /** What the amount should have been, not the delta — the service computes the delta. */
  correctedAmount: number;
  /** Optional: change category as part of the correction. Defaults to the original's category. */
  categoryId?: string;
  reason: string;
}