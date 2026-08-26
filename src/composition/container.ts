import type { SQLiteDatabase } from "expo-sqlite";
import { getDatabase } from "@/db/client";
import { runMigrations } from "@/db/migrationRunner";
import { migrations } from "@/db/migrations";
import type { ICategoryRepository } from "@/features/categories/repositories/ICategoryRepository";
import { SqliteCategoryRepository } from "@/features/categories/repositories/SqliteCategoryRepository";
import { CategoryService } from "@/features/categories/services/CategoryService";
import type { IAccountRepository } from "@/features/accounts/repositories/IAccountRepository";
import { SqliteAccountRepository } from "@/features/accounts/repositories/SqliteAccountRepository";
import { AccountService } from "@/features/accounts/services/AccountService";
import type { ITransactionRepository } from "@/features/transactions/repositories/ITransactionRepository";
import { SqliteTransactionRepository } from "@/features/transactions/repositories/SqliteTransactionRepository";
import { TransactionService } from "@/features/transactions/services/TransactionService";
import type { ITransferRepository } from "@/features/transfers/repositories/ITransferRepository";
import { SqliteTransferRepository } from "@/features/transfers/repositories/SqliteTransferRepository";
import { TransferService } from "@/features/transfers/services/TransferService";
import type { ILendBorrowRepository } from "@/features/lendBorrow/repositories/ILendBorrowRepository";
import { SqliteLendBorrowRepository } from "@/features/lendBorrow/repositories/SqliteLendBorrowRepository";
import { LendBorrowService } from "@/features/lendBorrow/services/LendBorrowService";
import type { IBudgetRepository } from "@/features/budgets/repositories/IBudgetRepository";
import { SqliteBudgetRepository } from "@/features/budgets/repositories/SqliteBudgetRepository";
import { BudgetService } from "@/features/budgets/services/BudgetService";
import type { IGoalRepository } from "@/features/goals/repositories/IGoalRepository";
import { SqliteGoalRepository } from "@/features/goals/repositories/SqliteGoalRepository";
import { GoalService } from "@/features/goals/services/GoalService";
import type { IInvestmentRepository } from "@/features/investments/repositories/IInvestmentRepository";
import { SqliteInvestmentRepository } from "@/features/investments/repositories/SqliteInvestmentRepository";
import { InvestmentService } from "@/features/investments/services/InvestmentService";
import { AnalyticsService } from "@/features/analytics/services/AnalyticsService";
import { DataService } from "@/features/data/services/DataService";

/**
 * The single composition root of the app.
 *
 * Nothing outside this file should ever import a concrete repository
 * (e.g. a future `SqliteAccountRepository`) directly. Feature services
 * depend only on interfaces (e.g. `IAccountRepository`); this container
 * is the one place that decides which concrete class satisfies each
 * interface, and hands the finished object to the rest of the app.
 *
 * If SQLite is ever swapped for a remote API, this is the only file
 * that changes — every service and screen that consumed the interface
 * keeps working untouched.
 *
 * Later phases extend this shape, e.g.:
 *   accountRepository: IAccountRepository;
 *   accountService: AccountService;
 */
export interface AppContainer {
  db: SQLiteDatabase;
  accountRepository: IAccountRepository;
  accountService: AccountService;
  categoryRepository: ICategoryRepository;
  categoryService: CategoryService;
  transactionRepository: ITransactionRepository;
  transactionService: TransactionService;
  transferRepository: ITransferRepository;
  transferService: TransferService;
  lendBorrowRepository: ILendBorrowRepository;
  lendBorrowService: LendBorrowService;
  budgetRepository: IBudgetRepository;
  budgetService: BudgetService;
  goalRepository: IGoalRepository;
  goalService: GoalService;
  investmentRepository: IInvestmentRepository;
  investmentService: InvestmentService;
  /** No repository of its own — Analytics is a read-only view over five other features' data. */
  analyticsService: AnalyticsService;
  /** No repository of its own either — reads and writes across eight other features' repositories. */
  dataService: DataService;
}

let containerInstance: AppContainer | null = null;

export async function buildContainer(): Promise<AppContainer> {
  const db = await getDatabase();
  await runMigrations(db, migrations);

  const accountRepository = new SqliteAccountRepository(db);
  const categoryRepository = new SqliteCategoryRepository(db);
  const transactionRepository = new SqliteTransactionRepository(db);
  const transferRepository = new SqliteTransferRepository(db);
  const lendBorrowRepository = new SqliteLendBorrowRepository(db);
  const budgetRepository = new SqliteBudgetRepository(db);
  const goalRepository = new SqliteGoalRepository(db);
  const investmentRepository = new SqliteInvestmentRepository(db);
  containerInstance = {
    db,
    accountRepository,
    accountService: new AccountService(accountRepository),
    categoryRepository,
    categoryService: new CategoryService(categoryRepository),
    transactionRepository,
    transactionService: new TransactionService(db, transactionRepository, accountRepository),
    transferRepository,
    transferService: new TransferService(db, transferRepository, accountRepository),
    lendBorrowRepository,
    lendBorrowService: new LendBorrowService(db, lendBorrowRepository, accountRepository),
    budgetRepository,
    budgetService: new BudgetService(budgetRepository, categoryRepository, transactionRepository),
    goalRepository,
    goalService: new GoalService(db, goalRepository, accountRepository),
    investmentRepository,
    investmentService: new InvestmentService(investmentRepository),
    analyticsService: new AnalyticsService(
      accountRepository,
      categoryRepository,
      transactionRepository,
      lendBorrowRepository,
      goalRepository
    ),
    dataService: new DataService(
      db,
      accountRepository,
      categoryRepository,
      transactionRepository,
      transferRepository,
      lendBorrowRepository,
      budgetRepository,
      goalRepository,
      investmentRepository
    ),
  };

  return containerInstance;
}

/**
 * For code that runs after startup and can assume the container is
 * already built (buildContainer() has resolved). Throws otherwise —
 * that's a bug (something tried to use the container before AppProvider
 * finished initializing), not a case to silently work around.
 */
export function getContainer(): AppContainer {
  if (!containerInstance) {
    throw new Error("Container not initialized — buildContainer() must resolve first (see AppProvider).");
  }
  return containerInstance;
}
