import { create } from "zustand";
import type { AccountService } from "../services/AccountService";
import type { Account, CreateAccountRequest } from "../types";

interface AccountState {
  accounts: Account[];
  netWorth: number;
  isLoading: boolean;
  error: string | null;
  load: (service: AccountService) => Promise<void>;
  add: (service: AccountService, request: CreateAccountRequest) => Promise<void>;
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Scoped to accounts only — there is no single giant app store. Actions
 * receive the service as a parameter instead of importing the DI
 * container, so this file has zero knowledge of SQLite, React context,
 * or how AccountService gets constructed.
 */
export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  netWorth: 0,
  isLoading: false,
  error: null,

  load: async (service) => {
    set({ isLoading: true, error: null });
    try {
      const accounts = await service.listAccounts();
      const netWorth = accounts.reduce((sum, a) => sum + a.currentBalance, 0);
      set({ accounts, netWorth, isLoading: false });
    } catch (error) {
      set({ error: toMessage(error), isLoading: false });
    }
  },

  add: async (service, request) => {
    const account = await service.createAccount(request);
    set((state) => ({
      accounts: [...state.accounts, account],
      netWorth: state.netWorth + account.currentBalance,
    }));
  },
}));
