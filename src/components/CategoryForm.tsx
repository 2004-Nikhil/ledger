import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import type { CategoryType, CreateCategoryRequest } from "@/features/categories/types";

type Props = {
  onSubmit: (request: CreateCategoryRequest) => Promise<void>;
};

export function CategoryForm({ onSubmit }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("expense");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim()) return setError("Name is required.");

    setIsSubmitting(true);
    try {
      await onSubmit({ name, type });
      setName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add custom category</Text>

      <TextInput style={styles.input} placeholder="Category name" value={name} onChangeText={setName} />

      <View style={styles.typeRow}>
        {(["expense", "income"] as CategoryType[]).map((t) => (
          <Pressable key={t} onPress={() => setType(t)} style={[styles.typeChip, type === t && styles.typeChipActive]}>
            <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
              {t === "expense" ? "Expense" : "Income"}
            </Text>
          </Pressable>
        ))}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={[styles.submit, isSubmitting && styles.submitDisabled]} onPress={handleSubmit} disabled={isSubmitting}>
        <Text style={styles.submitText}>{isSubmitting ? "Adding…" : "Add category"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#e5e7eb" },
  title: { fontSize: 15, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  typeRow: { flexDirection: "row", gap: 8 },
  typeChip: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  typeChipActive: { backgroundColor: "#111827", borderColor: "#111827" },
  typeChipText: { fontSize: 13, color: "#374151" },
  typeChipTextActive: { color: "#ffffff", fontWeight: "600" },
  error: { color: "#dc2626", fontSize: 13 },
  submit: { backgroundColor: "#111827", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: "#ffffff", fontWeight: "600", fontSize: 14 },
});
