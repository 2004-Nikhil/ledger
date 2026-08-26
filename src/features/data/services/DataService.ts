import type { SQLiteDatabase } from "expo-sqlite";
import type { IAccountRepository } from "@/features/accounts/repositories/IAccountRepository";
import type { ICategoryRepository } from "@/features/categories/repositories/ICategoryRepository";
import type { ITransactionRepository } from "@/features/transactions/repositories/ITransactionRepository";
import type { ITransferRepository } from "@/features/transfers/repositories/ITransferRepository";
import type { ILendBorrowRepository } from "@/features/lendBorrow/repositories/ILendBorrowRepository";
import type { IBudgetRepository } from "@/features/budgets/repositories/IBudgetRepository";
import type { IGoalRepository } from "@/features/goals/repositories/IGoalRepository";
import type { IInvestmentRepository } from "@/features/investments/repositories/IInvestmentRepository";
import type { BackupPayload, ImportSummary, ImportCounts } from "../types";
import { BACKUP_VERSION } from "../types";
import { validateBackupPayload } from "@/utils/validateBackup";

function bump(counts: ImportCounts, key: keyof ImportCounts): void {
  counts[key] = (counts[key] ?? 0) + 1;
}

/**
 * Like AnalyticsService, this has no table of its own — it reads and
 * writes across eight other features' repositories. Unlike Analytics,
 * it writes, which is why every repository call here uses the exact
 * fields from the backup file (including original ids and timestamps)
 * rather than going through a domain service — services generate new
 * ids and apply "this is a fresh user action" business rules, neither
 * of which is right for restoring a previously-created record.
 */
export class DataService {
  constructor(
    private db: SQLiteDatabase,
    private accountRepository: IAccountRepository,
    private categoryRepository: ICategoryRepository,
    private transactionRepository: ITransactionRepository,
    private transferRepository: ITransferRepository,
    private lendBorrowRepository: ILendBorrowRepository,
    private budgetRepository: IBudgetRepository,
    private goalRepository: IGoalRepository,
    private investmentRepository: IInvestmentRepository
  ) {}

  async exportBackup(): Promise<BackupPayload> {
    const [
      accounts,
      categories,
      transactions,
      transfers,
      lendBorrows,
      lendBorrowRepayments,
      budgets,
      goals,
      goalContributions,
      investments,
    ] = await Promise.all([
      this.accountRepository.findAll(),
      this.categoryRepository.findAll(),
      this.transactionRepository.findAll(),
      this.transferRepository.findAll(),
      this.lendBorrowRepository.findAll(),
      this.lendBorrowRepository.findAllRepayments(),
      this.budgetRepository.findAll(),
      this.goalRepository.findAll(),
      this.goalRepository.findAllContributions(),
      this.investmentRepository.findAll(),
    ]);

    return {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        accounts,
        categories,
        transactions,
        transfers,
        lendBorrows,
        lendBorrowRepayments,
        budgets,
        goals,
        goalContributions,
        investments,
      },
    };
  }

  /**
   * Merge semantics: a row is imported only if its id doesn't already
   * exist; existing rows are left completely untouched. This only
   * makes sense as "restore my own backup" — two independent installs'
   * ids never collide, so merging them wouldn't reconcile anything,
   * it would just juxtapose two unrelated ledgers. That's a deliberate
   * scope decision, not an oversight.
   *
   * Order matters: every table with a foreign key is imported after
   * the table(s) it references, or the INSERT would fail.
   */
  async importBackup(raw: unknown): Promise<ImportSummary> {
    const payload = validateBackupPayload(raw);
    const imported: ImportCounts = {};
    const skipped: ImportCounts = {};

    await this.db.withTransactionAsync(async () => {
      // 1. Accounts (no dependencies)
      for (const account of payload.data.accounts) {
        if (await this.accountRepository.findById(account.id)) {
          bump(skipped, "accounts");
          continue;
        }
        // create() sets currentBalance = openingBalance; restore the
        // real current balance afterward since they usually differ.
        await this.accountRepository.create({
          id: account.id,
          name: account.name,
          type: account.type,
          openingBalance: account.openingBalance,
          createdAt: account.createdAt,
        });
        const delta = account.currentBalance - account.openingBalance;
        if (delta !== 0) {
          await this.accountRepository.adjustBalance(account.id, delta);
        }
        bump(imported, "accounts");
      }

      // 2. Categories (no dependencies)
      for (const category of payload.data.categories) {
        if (await this.categoryRepository.findById(category.id)) {
          bump(skipped, "categories");
          continue;
        }
        await this.categoryRepository.create({
          id: category.id,
          name: category.name,
          type: category.type,
          createdAt: category.createdAt,
        });
        bump(imported, "categories");
      }

      // 3. Transactions (depend on categories, accounts)
      for (const t of payload.data.transactions) {
        if (await this.transactionRepository.findById(t.id)) {
          bump(skipped, "transactions");
          continue;
        }
        await this.transactionRepository.create({
          id: t.id,
          name: t.name,
          amount: t.amount,
          date: t.date,
          categoryId: t.categoryId,
          accountId: t.accountId,
          type: t.type,
          notes: t.notes,
          lockedUntil: t.lockedUntil,
          createdAt: t.createdAt,
          adjustsTransactionId: t.adjustsTransactionId,
        });
        bump(imported, "transactions");
      }

      // 4. Transfers (depend on accounts)
      for (const tr of payload.data.transfers) {
        if (await this.transferRepository.findById(tr.id)) {
          bump(skipped, "transfers");
          continue;
        }
        await this.transferRepository.create({
          id: tr.id,
          fromAccountId: tr.fromAccountId,
          toAccountId: tr.toAccountId,
          amount: tr.amount,
          date: tr.date,
          notes: tr.notes,
          createdAt: tr.createdAt,
        });
        bump(imported, "transfers");
      }

      // 5. Lend/borrow (depend on accounts)
      for (const lb of payload.data.lendBorrows) {
        if (await this.lendBorrowRepository.findById(lb.id)) {
          bump(skipped, "lendBorrows");
          continue;
        }
        // create() always starts a lend/borrow at paidAmount 0 / 'unpaid';
        // restore the real repayment state afterward if it had progressed.
        await this.lendBorrowRepository.create({
          id: lb.id,
          person: lb.person,
          amount: lb.amount,
          date: lb.date,
          direction: lb.direction,
          accountId: lb.accountId,
          dueDate: lb.dueDate,
          notes: lb.notes,
          createdAt: lb.createdAt,
        });
        if (lb.paidAmount > 0) {
          await this.lendBorrowRepository.updateRepayment(lb.id, lb.paidAmount, lb.status);
        }
        bump(imported, "lendBorrows");
      }

      // 6. Lend/borrow repayment log (depends on lend_borrows)
      for (const r of payload.data.lendBorrowRepayments) {
        if (await this.lendBorrowRepository.findRepaymentById(r.id)) {
          bump(skipped, "lendBorrowRepayments");
          continue;
        }
        await this.lendBorrowRepository.createRepaymentRecord({
          id: r.id,
          lendBorrowId: r.lendBorrowId,
          amount: r.amount,
          date: r.date,
          createdAt: r.createdAt,
        });
        bump(imported, "lendBorrowRepayments");
      }

      // 7. Budgets (depend on categories)
      for (const b of payload.data.budgets) {
        if (await this.budgetRepository.findById(b.id)) {
          bump(skipped, "budgets");
          continue;
        }
        await this.budgetRepository.create({
          id: b.id,
          categoryId: b.categoryId,
          month: b.month,
          allottedAmount: b.allottedAmount,
          rolloverEnabled: b.rolloverEnabled,
          createdAt: b.createdAt,
        });
        bump(imported, "budgets");
      }

      // 8. Goals (no dependencies)
      for (const g of payload.data.goals) {
        if (await this.goalRepository.findById(g.id)) {
          bump(skipped, "goals");
          continue;
        }
        // Same pattern as lend/borrow: create() always starts at 0 saved.
        await this.goalRepository.create({
          id: g.id,
          name: g.name,
          category: g.category,
          requiredAmount: g.requiredAmount,
          targetDate: g.targetDate,
          createdAt: g.createdAt,
        });
        if (g.accumulatedAmount > 0) {
          await this.goalRepository.updateAccumulated(g.id, g.accumulatedAmount);
        }
        bump(imported, "goals");
      }

      // 9. Goal contributions (depend on goals, accounts)
      for (const c of payload.data.goalContributions) {
        if (await this.goalRepository.findContributionById(c.id)) {
          bump(skipped, "goalContributions");
          continue;
        }
        await this.goalRepository.createContribution({
          id: c.id,
          goalId: c.goalId,
          accountId: c.accountId,
          amount: c.amount,
          date: c.date,
          createdAt: c.createdAt,
        });
        bump(imported, "goalContributions");
      }

      // 10. Investments (no dependencies)
      for (const inv of payload.data.investments) {
        if (await this.investmentRepository.findById(inv.id)) {
          bump(skipped, "investments");
          continue;
        }
        await this.investmentRepository.create({
          id: inv.id,
          type: inv.type,
          name: inv.name,
          units: inv.units,
          buyPrice: inv.buyPrice,
          currentValue: inv.currentValue,
          sipAmount: inv.sipAmount,
          sipFrequency: inv.sipFrequency,
          createdAt: inv.createdAt,
        });
        bump(imported, "investments");
      }
    });

    return { imported, skipped };
  }
}
