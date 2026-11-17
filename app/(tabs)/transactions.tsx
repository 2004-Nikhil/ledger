import { useMemo, useState } from "react";
import { View } from "react-native";
import { useTransactions } from "@/features/transactions/hooks/useTransactions";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { TransactionRow } from "@/components/TransactionList";
import { TransactionFilters } from "@/components/TransactionFilters";
import { TransactionCalendar } from "@/components/TransactionCalendar";
import { AdjustmentForm } from "@/components/AdjustmentForm";
import { MonthNavigator } from "@/components/MonthNavigator";
import { DEFAULT_FILTERS, DEFAULT_SORT, filterAndSortTransactions } from "@/utils/filterSort";
import { groupTransactionsByDay, dailyNetByDate } from "@/utils/calendarMath";
import { currentMonth, formatDisplayDate, shiftMonth } from "@/utils/date";
import type { Transaction } from "@/features/transactions/types";
import { Button, Divider, EmptyState, ErrorNotice, GlassCard, ListScreen, Segmented, Sheet, SkeletonRows, Text, space, useLatest, useMetrics, useShell } from "@/ui";

type ViewMode = "list" | "calendar";

const MODES: { value: ViewMode; label: string }[] = [
  { value: "list", label: "List" },
  { value: "calendar", label: "Calendar" },
];

export default function TransactionsScreen() {
  const { transactions, addAdjustmentEntry, isEditable, isLoading, error, refresh } = useTransactions();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { openQuickAdd } = useShell();
  const { gutter } = useMetrics();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [calendarMonth, setCalendarMonth] = useState(currentMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [adjusting, setAdjusting] = useState<Transaction | null>(null);
  const adjustingShown = useLatest(adjusting);

  const accountsById = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);
  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const filteredSorted = useMemo(() => filterAndSortTransactions(transactions, filters, sort), [transactions, filters, sort]);

  const transactionsByDay = useMemo(() => groupTransactionsByDay(transactions, calendarMonth), [transactions, calendarMonth]);
  const netByDate = useMemo(() => dailyNetByDate(transactionsByDay), [transactionsByDay]);
  const selectedDayTransactions = selectedDate ? (transactionsByDay.get(selectedDate) ?? []) : [];

  const rows = viewMode === "list" ? filteredSorted : selectedDayTransactions;
  const filtered = filters.search.trim() !== "" || filters.categoryId !== null || filters.accountId !== null;

  const headerExtra = (
    <View style={{ gap: space.lg }}>
      {error ? <ErrorNotice message={error} onRetry={refresh} /> : null}
      <Segmented options={MODES} value={viewMode} onChange={setViewMode} />

      {viewMode === "list" ? (
        <TransactionFilters filters={filters} onFiltersChange={setFilters} sort={sort} onSortChange={setSort} accounts={accounts} categories={categories} bleed={gutter} />
      ) : (
        <View style={{ gap: space.lg }}>
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
          <GlassCard padding={space.md}>
            <TransactionCalendar month={calendarMonth} netByDate={netByDate} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </GlassCard>
          {selectedDate ? (
            <Text variant="heading" accessibilityRole="header">
              {formatDisplayDate(selectedDate)}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );

  const empty =
    isLoading && transactions.length === 0 ? (
      <SkeletonRows count={5} />
    ) : viewMode === "calendar" ? (
      <EmptyState
        icon={selectedDate ? "receipt-outline" : "calendar-outline"}
        title={selectedDate ? "Nothing on this day" : "Pick a day"}
        message={selectedDate ? "No transactions were logged on this date." : "Select a day above to see what happened."}
      />
    ) : filtered ? (
      <EmptyState icon="search-outline" title="No matches" message="Try a different search or clear a filter." actionLabel="Clear filters" onAction={() => setFilters(DEFAULT_FILTERS)} />
    ) : (
      <EmptyState icon="receipt-outline" title="No transactions yet" message="Tap + to log your first one." actionLabel="Log transaction" onAction={openQuickAdd} />
    );

  return (
    <>
      <ListScreen<Transaction>
        title="Activity"
        subtitle={viewMode === "list" ? `${filteredSorted.length} ${filteredSorted.length === 1 ? "entry" : "entries"}${filtered ? " (filtered)" : ""}` : undefined}
        right={<Button label="Log" icon="add" size="sm" variant="glass" onPress={openQuickAdd} accessibilityLabel="Log a transaction" />}
        onRefresh={refresh}
        data={rows}
        keyExtractor={(t) => t.id}
        headerExtra={headerExtra}
        empty={empty}
        renderItem={(t, i) => (
          <View>
            {i > 0 && <Divider inset={56} />}
            <TransactionRow transaction={t} accountsById={accountsById} categoriesById={categoriesById} locked={!isEditable(t)} onAdjust={setAdjusting} />
          </View>
        )}
      />

      <Sheet visible={adjusting !== null} onClose={() => setAdjusting(null)} title="Adjust entry" subtitle="Corrects the balance and keeps the original visible">
        {adjustingShown ? (
          <AdjustmentForm
            original={adjustingShown}
            onCancel={() => setAdjusting(null)}
            onSubmit={async (request) => {
              await addAdjustmentEntry(request);
              setAdjusting(null);
            }}
          />
        ) : null}
      </Sheet>
    </>
  );
}
