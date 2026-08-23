export type LendBorrowDirection = "lent" | "borrowed";
export type LendBorrowStatus = "unpaid" | "partial" | "paid";

export interface LendBorrow {
  id: string;
  person: string;
  amount: number;
  date: string;
  direction: LendBorrowDirection;
  accountId: string;
  dueDate: string | null;
  notes: string | null;
  paidAmount: number;
  status: LendBorrowStatus;
  createdAt: string;
}

export interface CreateLendBorrowRequest {
  person: string;
  amount: number;
  date: string;
  direction: LendBorrowDirection;
  accountId: string;
  dueDate?: string;
  notes?: string;
}

export interface RecordRepaymentRequest {
  lendBorrowId: string;
  amount: number;
}

/** One dated repayment event — the audit trail recordRepayment writes to, alongside the cached paidAmount/status on LendBorrow. */
export interface LendBorrowRepaymentRecord {
  id: string;
  lendBorrowId: string;
  amount: number;
  date: string;
  createdAt: string;
}
