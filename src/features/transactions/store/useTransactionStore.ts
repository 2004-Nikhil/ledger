import { create } from "zustand";
import type { TransactionService } from "../services/TransactionService";
import type { Transaction, CreateTransactionRequest } from "../types";

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  load: (service: TransactionService) => Promise<void>;
  add: (service: TransactionService, request: CreateTransactionRequest) => Promise<void>;
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  isLoading: false,
  error: null,

  load: async (service) => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await service.listTransactions();
      set({ transactions, isLoading: false });
    } catch (error) {
      set({ error: toMessage(error), isLoading: false });
    }
  },

  add: async (service, request) => {
    const transaction = await service.createTransaction(request);
    set((state) => ({ transactions: [transaction, ...state.transactions] }));
  },
}));
