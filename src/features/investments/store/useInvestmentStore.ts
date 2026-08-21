import { create } from "zustand";
import type { InvestmentService } from "../services/InvestmentService";
import type { Investment, CreateInvestmentRequest, UpdateCurrentValueRequest } from "../types";

interface InvestmentState {
  investments: Investment[];
  isLoading: boolean;
  error: string | null;
  load: (service: InvestmentService) => Promise<void>;
  add: (service: InvestmentService, request: CreateInvestmentRequest) => Promise<void>;
  updateValue: (service: InvestmentService, request: UpdateCurrentValueRequest) => Promise<void>;
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export const useInvestmentStore = create<InvestmentState>((set) => ({
  investments: [],
  isLoading: false,
  error: null,

  load: async (service) => {
    set({ isLoading: true, error: null });
    try {
      const investments = await service.listInvestments();
      set({ investments, isLoading: false });
    } catch (error) {
      set({ error: toMessage(error), isLoading: false });
    }
  },

  add: async (service, request) => {
    const investment = await service.createInvestment(request);
    set((state) => ({ investments: [...state.investments, investment] }));
  },

  updateValue: async (service, request) => {
    await service.updateCurrentValue(request);
    set((state) => ({
      investments: state.investments.map((inv) =>
        inv.id === request.investmentId ? { ...inv, currentValue: request.currentValue } : inv
      ),
    }));
  },
}));
