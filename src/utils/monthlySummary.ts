import { Transaction } from "@/features/transactions/types";

export interface MonthlySummary {
  income: number;
  expense: number;
}

export function summarizeCurrentMonth(
  transactions: Transaction[],
  reference: Date = new Date()
): MonthlySummary {
  const year = reference.getFullYear();
  const month = reference.getMonth();

  return transactions.reduce<MonthlySummary>(
    (summary, transaction) => {
      const transactionDate = new Date(transaction.date);
      if (transactionDate.getFullYear() !== year || transactionDate.getMonth() !== month) {
        return summary;
      }
      if (transaction.type === "income") {
        summary.income += transaction.amount;
      } else {
        summary.expense += transaction.amount;
      }
      return summary;
    },
    { income: 0, expense: 0 }
  );
}
