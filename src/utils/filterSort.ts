import type { Transaction } from "@/features/transactions/types";

export interface TransactionFilters {
  search: string;
  categoryId: string | null;
  accountId: string | null;
  dateFrom: string | null;
  dateTo: string | null;
}

export type SortField = "date" | "amount";
export type SortDirection = "asc" | "desc";

export interface TransactionSort {
  field: SortField;
  direction: SortDirection;
}

export const DEFAULT_FILTERS: TransactionFilters = {
  search: "",
  categoryId: null,
  accountId: null,
  dateFrom: null,
  dateTo: null,
};

export const DEFAULT_SORT: TransactionSort = { field: "date", direction: "desc" };

export function filterAndSortTransactions(
  transactions: Transaction[],
  filters: TransactionFilters,
  sort: TransactionSort
): Transaction[] {
  const search = filters.search.trim().toLowerCase();

  const filtered = transactions.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search) && !(t.notes ?? "").toLowerCase().includes(search)) {
      return false;
    }
    if (filters.categoryId && t.categoryId !== filters.categoryId) return false;
    if (filters.accountId && t.accountId !== filters.accountId) return false;
    if (filters.dateFrom && t.date < filters.dateFrom) return false;
    if (filters.dateTo && t.date > filters.dateTo) return false;
    return true;
  });

  const sign = sort.direction === "asc" ? 1 : -1;
  return [...filtered].sort((a, b) => {
    if (sort.field === "amount") return (a.amount - b.amount) * sign;
    return (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) * sign;
  });
}
