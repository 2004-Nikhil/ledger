import { StyleSheet, View } from "react-native";
import { PressableScale, Text, colors, compactMoney, money } from "@/ui";
import { todayIso } from "@/utils/date";

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
  const today = todayIso();

  const cells: Array<{ day: number; date: string } | null> = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= totalDays; day++) {
    cells.push({ day, date: `${month}-${String(day).padStart(2, "0")}` });
  }

  return (
    <View>
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label, index) => (
          <Text key={index} variant="micro" tone="muted" style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell, index) => {
          if (!cell) return <View key={`empty-${index}`} style={styles.cell} />;

          const net = netByDate.get(cell.date);
          const isSelected = selectedDate === cell.date;
          const isToday = cell.date === today;

          return (
            <View key={cell.date} style={styles.cell}>
              <PressableScale
                onPress={() => onSelectDate(cell.date)}
                scale={0.94}
                accessibilityRole="button"
                accessibilityLabel={`${cell.date}${net !== undefined ? `, net ${net >= 0 ? "+" : "\u2212"}${money(Math.abs(net))}` : ", no transactions"}`}
                accessibilityState={{ selected: isSelected }}
                style={[styles.day, isToday && styles.today, isSelected && styles.selected]}
              >
                <Text variant="captionStrong" tone={isSelected ? "primary" : "secondary"}>
                  {cell.day}
                </Text>
                {net !== undefined ? (
                  <Text variant="micro" tone={net >= 0 ? "positive" : "negative"} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={styles.net}>
                    {net >= 0 ? "+" : ""}
                    {compactMoney(net)}
                  </Text>
                ) : null}
              </PressableScale>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const CELL_PERCENT = "14.2857%"; // 100 / 7

const styles = StyleSheet.create({
  weekdayRow: { flexDirection: "row", marginBottom: 6 },
  weekdayLabel: { width: CELL_PERCENT, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: CELL_PERCENT, aspectRatio: 1, padding: 2 },
  day: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: "transparent",
  },
  today: { borderColor: colors.borderStrong },
  selected: { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder },
  net: { fontSize: 10, lineHeight: 12, maxWidth: "100%" },
});
