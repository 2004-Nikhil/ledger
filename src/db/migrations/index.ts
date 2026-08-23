import type { Migration } from "./types";
import { migration001Initial } from "./001_initial";
import { migration002Categories } from "./002_categories";
import { migration003Transactions } from "./003_transactions";
import { migration004TransactionAdjustments } from "./004_transaction_adjustments";
import { migration005Transfers } from "./005_transfers";
import { migration006LendBorrow } from "./006_lend_borrow";
import { migration007Budgets } from "./007_budgets";
import { migration008Goals } from "./008_goals";
import { migration009Investments } from "./009_investments";
import { migration010LendBorrowRepayments } from "./010_lend_borrow_repayments";

// Append new migrations here, in order, as later phases add tables
// Never edit a migration that has already shipped — add a new one instead.
export const migrations: Migration[] = [
    migration001Initial,
    migration002Categories,
    migration003Transactions,
    migration004TransactionAdjustments,
    migration005Transfers,
    migration006LendBorrow,
    migration007Budgets,
    migration008Goals,
    migration009Investments,
    migration010LendBorrowRepayments,
];