import { create } from "zustand";
import type { CategoryService } from "../services/CategoryService";
import type { Category, CreateCategoryRequest } from "../types";

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  load: (service: CategoryService) => Promise<void>;
  add: (service: CategoryService, request: CreateCategoryRequest) => Promise<void>;
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  load: async (service) => {
    set({ isLoading: true, error: null });
    try {
      const categories = await service.listCategories();
      set({ categories, isLoading: false });
    } catch (error) {
      set({ error: toMessage(error), isLoading: false });
    }
  },

  add: async (service, request) => {
    const category = await service.createCustomCategory(request);
    set((state) => ({ categories: [...state.categories, category] }));
  },
}));
