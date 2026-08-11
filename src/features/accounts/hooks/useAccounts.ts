import { useEffect, useCallback } from "react";
import { useAppContainer } from "@/composition/AppProvider";
import { useAccountStore } from "../store/useAccountStore";
import type { CreateAccountRequest } from "../types";

export function useAccounts() {
  const { accountService } = useAppContainer();
  const accounts = useAccountStore((s) => s.accounts);
  const netWorth = useAccountStore((s) => s.netWorth);
  const isLoading = useAccountStore((s) => s.isLoading);
  const error = useAccountStore((s) => s.error);
  const load = useAccountStore((s) => s.load);
  const add = useAccountStore((s) => s.add);

  useEffect(() => {
    load(accountService);
  }, [accountService, load]);

  const addAccount = useCallback(
    (request: CreateAccountRequest) => add(accountService, request),
    [accountService, add]
  );

  const refresh = useCallback(() => load(accountService), [accountService, load]);

  return { accounts, netWorth, isLoading, error, addAccount, refresh };
}
