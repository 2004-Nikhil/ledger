import { View, Text, Pressable, StyleSheet } from "react-native";
import { formatCurrency } from "@/utils/currency";

type Props = {
  /** "YYYY-MM" */
  month: string;
  netByDate: Map<string, number>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
};

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function TransactionCalendar({ month, netByDate, selectedDate, onSelectDate }: Props) {
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;

  const firstWeekday = new Date(year, monthIndex, 1).getDay(); // 0 = Sunday
  const totalDays = daysInMonth(year, monthIndex);

  const cells: Array<{ day: number; date: string } | null> = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= totalDays; day++) {
    const date = `${month}-${String(day).padStart(2, "0")}`;
    cells.push({ day, date });
  }

  return (
    <View>
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label, index) => (
          <Text key={index} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell, index) => {
          if (!cell) return <View key={`empty-${index}`} style={styles.cell} />;

          const net = netByDate.get(cell.date);
          const isSelected = selectedDate === cell.date;

          return (
            <Pressable
              key={cell.date}
              style={[styles.cell, styles.dayCell, isSelected && styles.dayCellSelected]}
              onPress={() => onSelectDate(cell.date)}
            >
              <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>{cell.day}</Text>
              {net !== undefined && (
                <Text
                  style={[styles.dayNet, net >= 0 ? styles.dayNetPositive : styles.dayNetNegative]}
                  numberOfLines={1}
                >
                  {net >= 0 ? "+" : ""}
                  {formatCurrency(net)}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const CELL_PERCENT = "14.28%"; // 100 / 7

const styles = StyleSheet.create({
  weekdayRow: { flexDirection: "row" },
  weekdayLabel: { width: CELL_PERCENT, textAlign: "center", fontSize: 11, color: "#9ca3af", fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: CELL_PERCENT, aspectRatio: 1, alignItems: "center", justifyContent: "center", padding: 2 },
  dayCell: { borderRadius: 8 },
  dayCellSelected: { backgroundColor: "#eff6ff" },
  dayNumber: { fontSize: 12, color: "#374151" },
  dayNumberSelected: { color: "#2563eb", fontWeight: "700" },
  dayNet: { fontSize: 8, marginTop: 2 },
  dayNetPositive: { color: "#16a34a" },
  dayNetNegative: { color: "#dc2626" },
});
