import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import type { Account } from "@/features/accounts/types";
import type { Category } from "@/features/categories/types";
import type { TransactionFilters as Filters, TransactionSort } from "@/utils/filterSort";

type Props = {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  sort: TransactionSort;
  onSortChange: (sort: TransactionSort) => void;
  accounts: Account[];
  categories: Category[];
};

export function TransactionFilters({ filters, onFiltersChange, sort, onSortChange, accounts, categories }: Props) {
  const toggleSortField = (field: TransactionSort["field"]) => {
    if (sort.field === field) {
      onSortChange({ field, direction: sort.direction === "asc" ? "desc" : "asc" });
    } else {
      onSortChange({ field, direction: "desc" });
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search name or notes"
        value={filters.search}
        onChangeText={(search) => onFiltersChange({ ...filters, search })}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <Pressable
          onPress={() => onFiltersChange({ ...filters, categoryId: null })}
          style={[styles.chip, filters.categoryId === null && styles.chipActive]}
        >
          <Text style={[styles.chipText, filters.categoryId === null && styles.chipTextActive]}>All categories</Text>
        </Pressable>
        {categories.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => onFiltersChange({ ...filters, categoryId: c.id })}
            style={[styles.chip, filters.categoryId === c.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, filters.categoryId === c.id && styles.chipTextActive]}>{c.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <Pressable
          onPress={() => onFiltersChange({ ...filters, accountId: null })}
          style={[styles.chip, filters.accountId === null && styles.chipActive]}
        >
          <Text style={[styles.chipText, filters.accountId === null && styles.chipTextActive]}>All accounts</Text>
        </Pressable>
        {accounts.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => onFiltersChange({ ...filters, accountId: a.id })}
            style={[styles.chip, filters.accountId === a.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, filters.accountId === a.id && styles.chipTextActive]}>{a.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort:</Text>
        {(["date", "amount"] as const).map((field) => (
          <Pressable key={field} onPress={() => toggleSortField(field)} style={styles.sortButton}>
            <Text style={[styles.sortButtonText, sort.field === field && styles.sortButtonTextActive]}>
              {field === "date" ? "Date" : "Amount"} {sort.field === field ? (sort.direction === "asc" ? "\u2191" : "\u2193") : ""}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, marginBottom: 8 },
  search: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  chipScroll: { flexGrow: 0 },
  chip: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  chipActive: { backgroundColor: "#111827", borderColor: "#111827" },
  chipText: { fontSize: 12, color: "#374151" },
  chipTextActive: { color: "#ffffff", fontWeight: "600" },
  sortRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  sortLabel: { fontSize: 12, color: "#6b7280" },
  sortButton: { paddingVertical: 4 },
  sortButtonText: { fontSize: 12, color: "#9ca3af" },
  sortButtonTextActive: { color: "#2563eb", fontWeight: "700" },
});
