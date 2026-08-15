import type { SQLiteDatabase } from "expo-sqlite";
import type { ITransactionRepository, CreateTransactionRow } from "../repositories/ITransactionRepository";
import type { IAccountRepository } from "@/features/accounts/repositories/IAccountRepository";
import type { Transaction, CreateTransactionRequest, CreateAdjustmentRequest } from "../types";
import { generateId } from "@/utils/id";

/** How long a transaction stays editable after creation, per the feature plan. */
export const EDIT_WINDOW_MINUTES = 20;

/** A signed balance change to apply to one account, always as part of an atomic write. */
type BalanceEffect = { accountId: string; delta: number };

export class TransactionService {
  constructor(
    // `db` is used only to draw a transaction boundary around a
    // repository write plus its balance effects — it never runs raw SQL
    // itself. Everything that touches table shape still goes through
    // the repositories.
    private db: SQLiteDatabase,
    private transactionRepository: ITransactionRepository,
    private accountRepository: IAccountRepository
  ) {}

  async createTransaction(request: CreateTransactionRequest): Promise<Transaction> {
    if (!request.name.trim()) {
      throw new Error("Transaction name is required.");
    }
    if (!Number.isFinite(request.amount) || request.amount <= 0) {
      throw new Error("Amount must be greater than zero.");
    }

    const account = await this.accountRepository.findById(request.accountId);
    if (!account) {
      throw new Error("Selected account no longer exists.");
    }

    const now = new Date();
    const row: CreateTransactionRow = {
      id: generateId("txn"),
      name: request.name.trim(),
      amount: request.amount,
      date: request.date,
      categoryId: request.categoryId,
      accountId: request.accountId,
      type: request.type,
      notes: request.notes?.trim() || null,
      lockedUntil: new Date(now.getTime() + EDIT_WINDOW_MINUTES * 60_000).toISOString(),
      createdAt: now.toISOString(),
      adjustsTransactionId: null,
    };

    // The only place this sign decision is made — the account's balance
    // and the transaction row can never disagree about it.
    const delta = request.type === "income" ? request.amount : -request.amount;

    return this.persist(row, { accountId: request.accountId, delta });
  }

  /**
   * Corrects a locked transaction without ever touching its row. The
   * original stays exactly as created — the audit trail — and this adds
   * a new transaction that both nudges the account balance by the right
   * amount AND points back at what it's correcting.
   *
   * `correctedAmount` is what the amount should have been, not the
   * delta — callers shouldn't have to do this arithmetic themselves.
   */
  async createAdjustment(request: CreateAdjustmentRequest): Promise<Transaction> {
    if (!Number.isFinite(request.correctedAmount) || request.correctedAmount <= 0) {
      throw new Error("Corrected amount must be greater than zero.");
    }
    if (!request.reason.trim()) {
      throw new Error("A reason is required for an adjustment.");
    }

    const original = await this.transactionRepository.findById(request.originalTransactionId);
    if (!original) {
      throw new Error("The original transaction no longer exists.");
    }

    // Signed balance impact of a transaction of this type/amount.
    const impact = (type: Transaction["type"], amount: number) =>
      type === "income" ? amount : -amount;

    const originalImpact = impact(original.type, original.amount);
    const correctedImpact = impact(original.type, request.correctedAmount);
    const balanceDelta = correctedImpact - originalImpact;

    if (balanceDelta === 0) {
      throw new Error("Corrected amount matches the original — nothing to adjust.");
    }

    // The adjustment itself is just another income/expense transaction,
    // sized and signed to move the balance the remaining distance.
    const adjustmentType: Transaction["type"] = balanceDelta > 0 ? "income" : "expense";
    const adjustmentAmount = Math.abs(balanceDelta);

    const now = new Date();
    const row: CreateTransactionRow = {
      id: generateId("txn"),
      name: `Adjustment: ${original.name}`,
      amount: adjustmentAmount,
      date: original.date,
      categoryId: request.categoryId ?? original.categoryId,
      accountId: original.accountId,
      type: adjustmentType,
      notes: request.reason.trim(),
      lockedUntil: new Date(now.getTime() + EDIT_WINDOW_MINUTES * 60_000).toISOString(),
      createdAt: now.toISOString(),
      adjustsTransactionId: original.id,
    };

    return this.persist(row, { accountId: original.accountId, delta: balanceDelta });
  }

  async listTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.findAll();
  }

  /** The 15–20 min immutable-ledger rule, enforced here — not in the UI, not in the repository. */
  isEditable(transaction: Transaction): boolean {
    return new Date() < new Date(transaction.lockedUntil);
  }

  /** Shared atomic write: both the transaction row and its balance effect land together, or neither does. */
  private async persist(row: CreateTransactionRow, effect: BalanceEffect): Promise<Transaction> {
    let created: Transaction | undefined;
    await this.db.withTransactionAsync(async () => {
      created = await this.transactionRepository.create(row);
      await this.accountRepository.adjustBalance(effect.accountId, effect.delta);
    });
    if (!created) {
      throw new Error("Transaction failed to save.");
    }
    return created;
  }
}
