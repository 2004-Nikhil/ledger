import { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useTransactions } from "@/features/transactions/hooks/useTransactions";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { TransactionList } from "@/components/TransactionList";
import { TransactionFilters } from "@/components/TransactionFilters";
import { TransactionCalendar } from "@/components/TransactionCalendar";
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { AdjustmentForm } from "@/components/AdjustmentForm";
import { MonthNavigator } from "@/components/MonthNavigator";
import { DEFAULT_FILTERS, DEFAULT_SORT, filterAndSortTransactions } from "@/utils/filterSort";
import { groupTransactionsByDay, dailyNetByDate } from "@/utils/calendarMath";
import { currentMonth, shiftMonth } from "@/utils/date";
import type { Transaction } from "@/features/transactions/types";

type ViewMode = "list" | "calendar";

export default function TransactionsScreen() {
  const { transactions, addTransaction, addAdjustmentEntry, isEditable } = useTransactions();
  const { accounts } = useAccounts();
  const { categories, incomeCategories, expenseCategories } = useCategories();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [calendarMonth, setCalendarMonth] = useState(currentMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [adjusting, setAdjusting] = useState<Transaction | null>(null);

  const accountsById = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);
  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const filteredSorted = useMemo(
    () => filterAndSortTransactions(transactions, filters, sort),
    [transactions, filters, sort]
  );

  const transactionsByDay = useMemo(
    () => groupTransactionsByDay(transactions, calendarMonth),
    [transactions, calendarMonth]
  );
  const netByDate = useMemo(() => dailyNetByDate(transactionsByDay), [transactionsByDay]);
  const selectedDayTransactions = selectedDate ? (transactionsByDay.get(selectedDate) ?? []) : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggle, viewMode === "list" && styles.toggleActive]}
          onPress={() => setViewMode("list")}
        >
          <Text style={[styles.toggleText, viewMode === "list" && styles.toggleTextActive]}>List</Text>
        </Pressable>
        <Pressable
          style={[styles.toggle, viewMode === "calendar" && styles.toggleActive]}
          onPress={() => setViewMode("calendar")}
        >
          <Text style={[styles.toggleText, viewMode === "calendar" && styles.toggleTextActive]}>Calendar</Text>
        </Pressable>
      </View>

      {viewMode === "list" ? (
        <>
          <TransactionFilters
            filters={filters}
            onFiltersChange={setFilters}
            sort={sort}
            onSortChange={setSort}
            accounts={accounts}
            categories={categories}
          />
          <TransactionList
            transactions={filteredSorted}
            accountsById={accountsById}
            categoriesById={categoriesById}
            isEditable={isEditable}
            onAdjust={setAdjusting}
          />
        </>
      ) : (
        <>
          <MonthNavigator
            month={calendarMonth}
            onPrevious={() => {
              setCalendarMonth((m) => shiftMonth(m, -1));
              setSelectedDate(null);
            }}
            onNext={() => {
              setCalendarMonth((m) => shiftMonth(m, 1));
              setSelectedDate(null);
            }}
          />
          <TransactionCalendar
            month={calendarMonth}
            netByDate={netByDate}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          {selectedDate && (
            <View style={styles.daySection}>
              <Text style={styles.dayTitle}>{selectedDate}</Text>
              <TransactionList
                transactions={selectedDayTransactions}
                accountsById={accountsById}
                categoriesById={categoriesById}
                isEditable={isEditable}
                onAdjust={setAdjusting}
              />
            </View>
          )}
        </>
      )}

      {adjusting && (
        <AdjustmentForm
          original={adjusting}
          onCancel={() => setAdjusting(null)}
          onSubmit={async (request) => {
            await addAdjustmentEntry(request);
            setAdjusting(null);
          }}
        />
      )}

      <AddTransactionForm
        accounts={accounts}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        onSubmit={addTransaction}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 8 },
  toggleRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  toggle: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "#d1d5db", alignItems: "center" },
  toggleActive: { backgroundColor: "#111827", borderColor: "#111827" },
  toggleText: { fontSize: 13, color: "#374151", fontWeight: "600" },
  toggleTextActive: { color: "#ffffff" },
  daySection: { marginTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#e5e7eb" },
  dayTitle: { fontSize: 13, fontWeight: "700", color: "#374151", marginTop: 8 },
});
