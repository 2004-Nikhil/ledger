import { create } from "zustand";
import type { TransferService } from "../services/TransferService";
import type { Transfer, CreateTransferRequest } from "../types";

interface TransferState {
  transfers: Transfer[];
  isLoading: boolean;
  error: string | null;
  load: (service: TransferService) => Promise<void>;
  add: (service: TransferService, request: CreateTransferRequest) => Promise<void>;
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export const useTransferStore = create<TransferState>((set) => ({
  transfers: [],
  isLoading: false,
  error: null,

  load: async (service) => {
    set({ isLoading: true, error: null });
    try {
      const transfers = await service.listTransfers();
      set({ transfers, isLoading: false });
    } catch (error) {
      set({ error: toMessage(error), isLoading: false });
    }
  },

  add: async (service, request) => {
    const transfer = await service.createTransfer(request);
    set((state) => ({ transfers: [transfer, ...state.transfers] }));
  },
}));
