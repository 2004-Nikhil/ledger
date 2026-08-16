import { useEffect, useCallback } from "react";
import { useAppContainer } from "@/composition/AppProvider";
import { useLendBorrowStore } from "../store/useLendBorrowStore";
import { useAccountStore } from "@/features/accounts/store/useAccountStore";
import type { CreateLendBorrowRequest, RecordRepaymentRequest } from "../types";

export function useLendBorrow() {
  const { lendBorrowService, accountService } = useAppContainer();

  const entries = useLendBorrowStore((s) => s.entries);
  const isLoading = useLendBorrowStore((s) => s.isLoading);
  const error = useLendBorrowStore((s) => s.error);
  const load = useLendBorrowStore((s) => s.load);
  const add = useLendBorrowStore((s) => s.add);
  const repay = useLendBorrowStore((s) => s.repay);
  const loadAccounts = useAccountStore((s) => s.load);

  useEffect(() => {
    load(lendBorrowService);
  }, [lendBorrowService, load]);

  const addEntry = useCallback(
    async (request: CreateLendBorrowRequest) => {
      await add(lendBorrowService, request);
      await loadAccounts(accountService);
    },
    [lendBorrowService, accountService, add, loadAccounts]
  );

  const recordRepayment = useCallback(
    async (request: RecordRepaymentRequest) => {
      await repay(lendBorrowService, request);
      await loadAccounts(accountService);
    },
    [lendBorrowService, accountService, repay, loadAccounts]
  );

  const refresh = useCallback(() => load(lendBorrowService), [lendBorrowService, load]);

  return { entries, isLoading, error, addEntry, recordRepayment, refresh };
}
