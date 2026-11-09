import { useState } from "react";
import { View } from "react-native";
import type { Account } from "@/features/accounts/types";
import type { Category } from "@/features/categories/types";
import type { TransactionFilters as Filters, TransactionSort } from "@/utils/filterSort";
import { Chip, ChipRow, IconButton, Text, TextField, space } from "@/ui";

type Props = {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  sort: TransactionSort;
  onSortChange: (sort: TransactionSort) => void;
  accounts: Account[];
  categories: Category[];
  /** Horizontal page padding, so chip rows can scroll edge to edge. */
  bleed?: number;
};

export function TransactionFilters({ filters, onFiltersChange, sort, onSortChange, accounts, categories, bleed = 0 }: Props) {
  const [open, setOpen] = useState(false);
  const activeCount = (filters.categoryId ? 1 : 0) + (filters.accountId ? 1 : 0);

  const toggleSortField = (field: TransactionSort["field"]) => {
    if (sort.field === field) {
      onSortChange({ field, direction: sort.direction === "asc" ? "desc" : "asc" });
    } else {
      onSortChange({ field, direction: "desc" });
    }
  };

  return (
    <View style={{ gap: space.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
        <View style={{ flex: 1 }}>
          <TextField
            icon="search-outline"
            placeholder="Search name or notes"
            value={filters.search}
            onChangeText={(search) => onFiltersChange({ ...filters, search })}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Search transactions"
          />
        </View>
        <View>
          <IconButton
            icon={open ? "options" : "options-outline"}
            size={52}
            accessibilityLabel={open ? "Hide filters" : activeCount ? `Show filters, ${activeCount} active` : "Show filters"}
            onPress={() => setOpen((v) => !v)}
            style={{ borderRadius: 16, ...(activeCount ? { borderColor: "rgba(79,124,255,0.42)", backgroundColor: "rgba(79,124,255,0.16)" } : null) }}
          />
          {activeCount > 0 && (
            <View style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: "#45D9FF" }} />
          )}
        </View>
      </View>

      {open && (
        <View style={{ gap: space.md }}>
          <View style={{ gap: 8 }}>
            <Text variant="captionStrong" tone="secondary">
              Category
            </Text>
            <ChipRow bleed={bleed}>
              <Chip label="All" selected={filters.categoryId === null} onPress={() => onFiltersChange({ ...filters, categoryId: null })} accessibilityLabel="All categories" />
              {categories.map((c) => (
                <Chip key={c.id} label={c.name} selected={filters.categoryId === c.id} onPress={() => onFiltersChange({ ...filters, categoryId: c.id })} />
              ))}
            </ChipRow>
          </View>
          <View style={{ gap: 8 }}>
            <Text variant="captionStrong" tone="secondary">
              Account
            </Text>
            <ChipRow bleed={bleed}>
              <Chip label="All" selected={filters.accountId === null} onPress={() => onFiltersChange({ ...filters, accountId: null })} accessibilityLabel="All accounts" />
              {accounts.map((a) => (
                <Chip key={a.id} label={a.name} selected={filters.accountId === a.id} onPress={() => onFiltersChange({ ...filters, accountId: a.id })} />
              ))}
            </ChipRow>
          </View>
        </View>
      )}

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text variant="caption" tone="secondary">
          Sort by
        </Text>
        {(["date", "amount"] as const).map((field) => {
          const selected = sort.field === field;
          return (
            <Chip
              key={field}
              label={field === "date" ? "Date" : "Amount"}
              icon={selected ? (sort.direction === "asc" ? "arrow-up" : "arrow-down") : undefined}
              selected={selected}
              onPress={() => toggleSortField(field)}
              accessibilityLabel={`Sort by ${field}${selected ? (sort.direction === "asc" ? ", ascending" : ", descending") : ""}`}
            />
          );
        })}
      </View>
    </View>
  );
}
