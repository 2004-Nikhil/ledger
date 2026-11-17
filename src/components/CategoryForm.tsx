import { useState } from "react";
import { View } from "react-native";
import type { CategoryType, CreateCategoryRequest } from "@/features/categories/types";
import { Button, InlineError, Segmented, Text, TextField, space } from "@/ui";

type Props = {
  onSubmit: (request: CreateCategoryRequest) => Promise<void>;
};

const TYPES: { value: CategoryType; label: string }[] = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
];

/** Rendered inside a Sheet titled "New category". */
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
    <View style={{ gap: space.lg }}>
      <TextField label="Category name" placeholder="e.g. Subscriptions" value={name} onChangeText={setName} />

      <View style={{ gap: 8 }}>
        <Text variant="captionStrong" tone="secondary">
          Type
        </Text>
        <Segmented options={TYPES} value={type} onChange={setType} />
      </View>

      {error ? <InlineError message={error} /> : null}

      <Button label={isSubmitting ? "Adding…" : "Add category"} loading={isSubmitting} onPress={handleSubmit} fullWidth size="lg" />
    </View>
  );
}
