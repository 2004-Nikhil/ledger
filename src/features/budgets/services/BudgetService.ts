import type { IBudgetRepository } from "../repositories/IBudgetRepository";
import type { ICategoryRepository } from "@/features/categories/repositories/ICategoryRepository";
import type { ITransactionRepository } from "@/features/transactions/repositories/ITransactionRepository";
import type { Budget, SetBudgetRequest, CategoryBudgetSummary } from "../types";
import { computeBudgetSummaries } from "@/utils/budgetMath";
import { generateId } from "@/utils/id";

export class BudgetService {
  constructor(
    private budgetRepository: IBudgetRepository,
    private categoryRepository: ICategoryRepository,
    private transactionRepository: ITransactionRepository
  ) {}

  /**
   * Upserts: one budget row per category per month. No db transaction
   * needed here — unlike Transactions/Transfers/LendBorrow, setting a
   * budget is a planning entity and never moves money, so there's no
   * account balance to keep in sync.
   */
  async setBudget(request: SetBudgetRequest): Promise<Budget> {
    if (!Number.isFinite(request.allottedAmount) || request.allottedAmount < 0) {
      throw new Error("Allotted amount must be zero or greater.");
    }

    const category = await this.categoryRepository.findById(request.categoryId);
    if (!category) {
      throw new Error("Category no longer exists.");
    }
    if (category.type !== "expense") {
      throw new Error("Budgets can only be set for expense categories.");
    }

    const existing = await this.budgetRepository.findByCategoryAndMonth(request.categoryId, request.month);
    if (existing) {
      return this.budgetRepository.update(existing.id, request.allottedAmount, request.rolloverEnabled);
    }

    return this.budgetRepository.create({
      id: generateId("bud"),
      categoryId: request.categoryId,
      month: request.month,
      allottedAmount: request.allottedAmount,
      rolloverEnabled: request.rolloverEnabled,
      createdAt: new Date().toISOString(),
    });
  }

  async getMonthlySummary(month: string): Promise<CategoryBudgetSummary[]> {
    const [budgets, transactions, categories] = await Promise.all([
      this.budgetRepository.findAll(),
      this.transactionRepository.findAll(),
      this.categoryRepository.findAll(),
    ]);

    const expenseCategories = categories.filter((c) => c.type === "expense");
    return computeBudgetSummaries(budgets, transactions, expenseCategories, month);
  }
}
