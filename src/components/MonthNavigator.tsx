import { StyleSheet, View } from "react-native";
import { IconButton, Text } from "@/ui";
import { colors, radius } from "@/ui";
import { formatMonthLabel } from "@/utils/date";

type Props = {
  month: string;
  onPrevious: () => void;
  onNext: () => void;
};

/** Glass pill: previous · month · next. Arrows are full 44pt touch targets. */
export function MonthNavigator({ month, onPrevious, onNext }: Props) {
  const label = formatMonthLabel(month);
  return (
    <View style={styles.row} accessibilityRole="toolbar">
      <IconButton icon="chevron-back" size={40} accessibilityLabel="Previous month" onPress={onPrevious} style={styles.arrow} />
      <Text variant="subheading" style={styles.label} accessibilityLiveRegion="polite" numberOfLines={1}>
        {label}
      </Text>
      <IconButton icon="chevron-forward" size={40} accessibilityLabel="Next month" onPress={onNext} style={styles.arrow} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 4,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: colors.border,
    backgroundColor: colors.glass,
  },
  arrow: { borderWidth: 0, backgroundColor: "rgba(255,255,255,0.05)" },
  label: { flex: 1, textAlign: "center" },
});
