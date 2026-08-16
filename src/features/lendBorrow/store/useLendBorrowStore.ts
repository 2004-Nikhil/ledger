import { create } from "zustand";
import type { LendBorrowService } from "../services/LendBorrowService";
import type { LendBorrow, CreateLendBorrowRequest, RecordRepaymentRequest } from "../types";

interface LendBorrowState {
  entries: LendBorrow[];
  isLoading: boolean;
  error: string | null;
  load: (service: LendBorrowService) => Promise<void>;
  add: (service: LendBorrowService, request: CreateLendBorrowRequest) => Promise<void>;
  repay: (service: LendBorrowService, request: RecordRepaymentRequest) => Promise<void>;
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export const useLendBorrowStore = create<LendBorrowState>((set) => ({
  entries: [],
  isLoading: false,
  error: null,

  load: async (service) => {
    set({ isLoading: true, error: null });
    try {
      const entries = await service.listAll();
      set({ entries, isLoading: false });
    } catch (error) {
      set({ error: toMessage(error), isLoading: false });
    }
  },

  add: async (service, request) => {
    const entry = await service.create(request);
    set((state) => ({ entries: [entry, ...state.entries] }));
  },

  repay: async (service, request) => {
    const updated = await service.recordRepayment(request);
    set((state) => ({
      entries: state.entries.map((e) => (e.id === updated.id ? updated : e)),
    }));
  },
}));
