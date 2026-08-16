import { useEffect, useCallback } from "react";
import { useAppContainer } from "@/composition/AppProvider";
import { useTransferStore } from "../store/useTransferStore";
import { useAccountStore } from "@/features/accounts/store/useAccountStore";
import type { CreateTransferRequest } from "../types";

export function useTransfers() {
  const { transferService, accountService } = useAppContainer();

  const transfers = useTransferStore((s) => s.transfers);
  const isLoading = useTransferStore((s) => s.isLoading);
  const error = useTransferStore((s) => s.error);
  const load = useTransferStore((s) => s.load);
  const add = useTransferStore((s) => s.add);
  const loadAccounts = useAccountStore((s) => s.load);

  useEffect(() => {
    load(transferService);
  }, [transferService, load]);

  const addTransfer = useCallback(
    async (request: CreateTransferRequest) => {
      await add(transferService, request);
      await loadAccounts(accountService);
    },
    [transferService, accountService, add, loadAccounts]
  );

  const refresh = useCallback(() => load(transferService), [transferService, load]);

  return { transfers, isLoading, error, addTransfer, refresh };
}
