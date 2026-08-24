import type { IAccountRepository } from "@/features/accounts/repositories/IAccountRepository";
import type { ICategoryRepository } from "@/features/categories/repositories/ICategoryRepository";
import type { ITransactionRepository } from "@/features/transactions/repositories/ITransactionRepository";
import type { ILendBorrowRepository } from "@/features/lendBorrow/repositories/ILendBorrowRepository";
import type { IGoalRepository } from "@/features/goals/repositories/IGoalRepository";
import type {
  CategoryBreakdownSlice,
  BalanceTrendPoint,
  MonthlyIncomeExpense,
  CategoryTrendPoint,
} from "../types";
import {
  buildBalanceDeltas,
  computeBalanceTrend,
  computeIncomeExpenseTrend,
  computeCategoryBreakdown,
  computeCategoryTrend,
} from "@/utils/analyticsMath";

/**
 * Analytics has no persisted entity of its own — it's a read-only view
 * over five other features' data. That's why it skips the repository/
 * service split every other feature uses for writes: there's nothing
 * to write. It still depends only on interfaces, for the same reason
 * every other service does (testability, and no feature ever imports
 * another feature's concrete SQLite class).
 */
export class AnalyticsService {
  constructor(
    private accountRepository: IAccountRepository,
    private categoryRepository: ICategoryRepository,
    private transactionRepository: ITransactionRepository,
    private lendBorrowRepository: ILendBorrowRepository,
    private goalRepository: IGoalRepository
  ) {}

  async getBalanceTrend(monthsBack: number): Promise<BalanceTrendPoint[]> {
    const [accounts, transactions, lendBorrows, repayments, contributions] = await Promise.all([
      this.accountRepository.findAll(),
      this.transactionRepository.findAll(),
      this.lendBorrowRepository.findAll(),
      this.lendBorrowRepository.findAllRepayments(),
      this.goalRepository.findAllContributions(),
    ]);

    const currentTotalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);
    const deltas = buildBalanceDeltas(transactions, lendBorrows, repayments, contributions);
    return computeBalanceTrend(currentTotalBalance, deltas, monthsBack);
  }

  async getIncomeExpenseTrend(monthsBack: number): Promise<MonthlyIncomeExpense[]> {
    const transactions = await this.transactionRepository.findAll();
    return computeIncomeExpenseTrend(transactions, monthsBack);
  }

  async getCategoryBreakdown(month: string): Promise<CategoryBreakdownSlice[]> {
    const [transactions, categories] = await Promise.all([
      this.transactionRepository.findAll(),
      this.categoryRepository.findAll(),
    ]);
    return computeCategoryBreakdown(transactions, categories, month);
  }

  async getCategoryTrend(categoryId: string, monthsBack: number): Promise<CategoryTrendPoint[]> {
    const transactions = await this.transactionRepository.findAll();
    return computeCategoryTrend(transactions, categoryId, monthsBack);
  }
}
