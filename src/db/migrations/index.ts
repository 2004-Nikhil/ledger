import type { Migration } from "./types";
import { migration001Initial } from "./001_initial";
import { migration002Categories } from "./002_categories";
import { migration003Transactions } from "./003_transactions";

// Append new migrations here, in order, as later phases add tables
// Never edit a migration that has already shipped — add a new one instead.
export const migrations: Migration[] = [
    migration001Initial,
    migration002Categories,
    migration003Transactions
];