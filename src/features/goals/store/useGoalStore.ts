import { create } from "zustand";
import type { GoalService } from "../services/GoalService";
import type { Goal, CreateGoalRequest, ContributeToGoalRequest } from "../types";

interface GoalState {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  load: (service: GoalService) => Promise<void>;
  add: (service: GoalService, request: CreateGoalRequest) => Promise<void>;
  contribute: (service: GoalService, request: ContributeToGoalRequest) => Promise<void>;
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: [],
  isLoading: false,
  error: null,

  load: async (service) => {
    set({ isLoading: true, error: null });
    try {
      const goals = await service.listGoals();
      set({ goals, isLoading: false });
    } catch (error) {
      set({ error: toMessage(error), isLoading: false });
    }
  },

  add: async (service, request) => {
    const goal = await service.createGoal(request);
    set((state) => ({ goals: [...state.goals, goal] }));
  },

  contribute: async (service, request) => {
    await service.contribute(request);
    // Reload rather than patch — the goal's accumulated total changed
    // server-side, and this keeps the client from ever drifting from it.
    const goals = await service.listGoals();
    set({ goals });
  },
}));
