import { useMemo, useState } from "react";
import { PanResponder, StyleSheet, View } from "react-native";
import Svg, { Defs, G, Line, LinearGradient, Rect, Stop } from "react-native-svg";
import { useSvgId } from "../Gradient";
import { useDrawProgress } from "../hooks";
import { Text } from "../Text";
import { colors, motion, radius } from "../theme";
import { labelStride, nearestIndex } from "./chartMath";

export interface FlowDatum {
  label: string;
  income: number;
  expense: number;
}

const PAD = { t: 34, b: 28, l: 12, r: 12 };

/**
 * Income against expense per month: paired hairline-soft bars that rise from
 * a quiet baseline. Emerald and coral appear only because these two really
 * are positive and negative movement.
 */
export function FlowBars({ data, height = 196, formatValue }: { data: FlowDatum[]; height?: number; formatValue: (n: number) => string }) {
  const [w, setW] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const incomeId = useSvgId("fi");
  const expenseId = useSvgId("fe");
  const p = useDrawProgress(data.map((d) => `${d.income}:${d.expense}`).join("|"), motion.chart);

  const geo = useMemo(() => {
    if (w <= 0 || data.length === 0) return null;
    const plotW = w - PAD.l - PAD.r;
    const plotH = height - PAD.t - PAD.b;
    const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));
    const groupW = plotW / data.length;
    const barW = Math.max(6, Math.min(16, groupW * 0.22));
    const gap = Math.max(3, barW * 0.35);
    const centers = data.map((_, i) => PAD.l + groupW * (i + 0.5));
    return { plotW, plotH, max, groupW, barW, gap, centers, baseline: PAD.t + plotH };
  }, [w, height, data]);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => geo && setActive(nearestIndex(e.nativeEvent.locationX, geo.centers)),
        onPanResponderMove: (e) => geo && setActive(nearestIndex(e.nativeEvent.locationX, geo.centers)),
      }),
    [geo]
  );

  if (data.length === 0) return null;
  const stride = geo ? labelStride(data.length, geo.plotW, 40) : 1;

  return (
    <View>
      <View
        style={{ height }}
        onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))}
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Income versus expense for ${data.length} months. Latest month: income ${formatValue(data[data.length - 1].income)}, expense ${formatValue(data[data.length - 1].expense)}.`}
      >
        {geo && (
          <>
            <Svg width={w} height={height}>
              <Defs>
                <LinearGradient id={incomeId} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#35E6A4" stopOpacity={0.95} />
                  <Stop offset="1" stopColor="#35E6A4" stopOpacity={0.18} />
                </LinearGradient>
                <LinearGradient id={expenseId} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#FF6B7A" stopOpacity={0.9} />
                  <Stop offset="1" stopColor="#FF6B7A" stopOpacity={0.16} />
                </LinearGradient>
              </Defs>

              {[0, 0.5, 1].map((f) => (
                <Line key={f} x1={PAD.l} x2={w - PAD.r} y1={PAD.t + geo.plotH * f} y2={PAD.t + geo.plotH * f} stroke="#FFFFFF" strokeOpacity={0.045} strokeWidth={1} />
              ))}

              {data.map((d, i) => {
                const cx = geo.centers[i];
                const hi = (d.income / geo.max) * geo.plotH * p;
                const he = (d.expense / geo.max) * geo.plotH * p;
                const dim = active !== null && active !== i ? 0.4 : 1;
                return (
                  <G key={d.label + i}>
                    {active === i && (
                      <Rect x={cx - geo.groupW / 2 + 3} y={PAD.t - 8} width={geo.groupW - 6} height={geo.plotH + 8} rx={12} fill="#FFFFFF" fillOpacity={0.045} />
                    )}
                    <Rect x={cx - geo.gap / 2 - geo.barW} y={geo.baseline - Math.max(hi, d.income > 0 ? 2 : 0)} width={geo.barW} height={Math.max(hi, d.income > 0 ? 2 : 0)} rx={geo.barW / 2} fill={`url(#${incomeId})`} opacity={dim} />
                    <Rect x={cx + geo.gap / 2} y={geo.baseline - Math.max(he, d.expense > 0 ? 2 : 0)} width={geo.barW} height={Math.max(he, d.expense > 0 ? 2 : 0)} rx={geo.barW / 2} fill={`url(#${expenseId})`} opacity={dim} />
                  </G>
                );
              })}
            </Svg>

            {data.map((d, i) =>
              i % stride === 0 || i === data.length - 1 ? (
                <Text key={`l-${i}`} variant="micro" tone={active === i ? "primary" : "muted"} numberOfLines={1} style={{ position: "absolute", bottom: 4, width: 44, left: geo.centers[i] - 22, textAlign: "center" }}>
                  {d.label}
                </Text>
              ) : null
            )}

            {active !== null && <FlowTooltip x={geo.centers[active]} width={w} datum={data[active]} formatValue={formatValue} />}
            <View style={StyleSheet.absoluteFill} {...responder.panHandlers} />
          </>
        )}
      </View>

      <View style={styles.legend}>
        <LegendDot color="#35E6A4" label="Income" />
        <LegendDot color="#FF6B7A" label="Expense" />
      </View>
    </View>
  );
}

function FlowTooltip({ x, width, datum, formatValue }: { x: number; width: number; datum: FlowDatum; formatValue: (n: number) => string }) {
  const TW = 148;
  const left = Math.max(4, Math.min(width - TW - 4, x - TW / 2));
  return (
    <View pointerEvents="none" style={[styles.tip, { left, width: TW }]}>
      <Text variant="micro" tone="secondary">
        {datum.label}
      </Text>
      <View style={styles.tipRow}>
        <View style={[styles.dot, { backgroundColor: "#35E6A4" }]} />
        <Text variant="captionStrong" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
          {formatValue(datum.income)}
        </Text>
      </View>
      <View style={styles.tipRow}>
        <View style={[styles.dot, { backgroundColor: "#FF6B7A" }]} />
        <Text variant="captionStrong" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
          {formatValue(datum.expense)}
        </Text>
      </View>
    </View>
  );
}

export function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { flexDirection: "row", gap: 18, justifyContent: "center", paddingTop: 6 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  tip: {
    position: "absolute",
    top: 0,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 2,
    borderRadius: radius.md,
    backgroundColor: "rgba(18,23,34,0.94)",
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: colors.borderStrong,
  },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 8 },
});
