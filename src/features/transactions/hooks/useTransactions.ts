import { useEffect, useCallback } from "react";
import { useAppContainer } from "@/composition/AppProvider";
import { useTransactionStore } from "../store/useTransactionStore";
import { useAccountStore } from "@/features/accounts/store/useAccountStore";
import type { CreateTransactionRequest, Transaction } from "../types";

export function useTransactions() {
  const { transactionService, accountService } = useAppContainer();

  const transactions = useTransactionStore((s) => s.transactions);
  const isLoading = useTransactionStore((s) => s.isLoading);
  const error = useTransactionStore((s) => s.error);
  const load = useTransactionStore((s) => s.load);
  const add = useTransactionStore((s) => s.add);

  // Account balances change as a side effect of creating a transaction —
  // this is the one place that coordinates the two features refreshing.
  const loadAccounts = useAccountStore((s) => s.load);

  useEffect(() => {
    load(transactionService);
  }, [transactionService, load]);

  const addTransaction = useCallback(
    async (request: CreateTransactionRequest) => {
      await add(transactionService, request);
      await loadAccounts(accountService);
    },
    [transactionService, accountService, add, loadAccounts]
  );

  const refresh = useCallback(() => load(transactionService), [transactionService, load]);

  const isEditable = useCallback(
    (transaction: Transaction) => transactionService.isEditable(transaction),
    [transactionService]
  );

  return { transactions, isLoading, error, addTransaction, refresh, isEditable };
}
