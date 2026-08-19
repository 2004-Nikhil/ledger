import { create } from "zustand";
import type { BudgetService } from "../services/BudgetService";
import type { CategoryBudgetSummary, SetBudgetRequest } from "../types";

interface BudgetState {
  summaries: CategoryBudgetSummary[];
  isLoading: boolean;
  error: string | null;
  load: (service: BudgetService, month: string) => Promise<void>;
  setBudget: (service: BudgetService, request: SetBudgetRequest) => Promise<void>;
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export const useBudgetStore = create<BudgetState>((set) => ({
  summaries: [],
  isLoading: false,
  error: null,

  load: async (service, month) => {
    set({ isLoading: true, error: null });
    try {
      const summaries = await service.getMonthlySummary(month);
      set({ summaries, isLoading: false });
    } catch (error) {
      set({ error: toMessage(error), isLoading: false });
    }
  },

  setBudget: async (service, request) => {
    await service.setBudget(request);
    // Reload rather than patch in place — a single change can shift
    // rollover math for the month being viewed, so the whole summary
    // is recomputed from source rather than guessed at locally.
    const summaries = await service.getMonthlySummary(request.month);
    set({ summaries });
  },
}));
