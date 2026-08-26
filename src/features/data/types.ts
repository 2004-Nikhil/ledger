import type { Account } from "@/features/accounts/types";
import type { Category } from "@/features/categories/types";
import type { Transaction } from "@/features/transactions/types";
import type { Transfer } from "@/features/transfers/types";
import type { LendBorrow, LendBorrowRepaymentRecord } from "@/features/lendBorrow/types";
import type { Budget } from "@/features/budgets/types";
import type { Goal, GoalContribution } from "@/features/goals/types";
import type { Investment } from "@/features/investments/types";

export const BACKUP_VERSION = 1;

export interface BackupData {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  transfers: Transfer[];
  lendBorrows: LendBorrow[];
  lendBorrowRepayments: LendBorrowRepaymentRecord[];
  budgets: Budget[];
  goals: Goal[];
  goalContributions: GoalContribution[];
  investments: Investment[];
}

export interface BackupPayload {
  version: number;
  exportedAt: string;
  data: BackupData;
}

/** Table name -> row count, for both halves of a merge-import. */
export type ImportCounts = Partial<Record<keyof BackupData, number>>;

export interface ImportSummary {
  imported: ImportCounts;
  skipped: ImportCounts;
}
