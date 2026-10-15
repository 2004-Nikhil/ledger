import { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useDrawProgress } from "../hooks";
import { motion } from "../theme";

export interface DonutSlice {
  key: string;
  value: number;
  color: string;
}

/** Thin aurora ring: segments separated by hairline gaps, one can be lifted. */
export function Donut({
  slices,
  size = 200,
  stroke = 14,
  activeKey,
  center,
}: {
  slices: DonutSlice[];
  size?: number;
  stroke?: number;
  activeKey?: string | null;
  center?: ReactNode;
}) {
  const p = useDrawProgress(slices.map((s) => `${s.key}:${s.value}`).join("|"), motion.chart);
  const r = (size - stroke - 6) / 2;
  const c = size / 2;
  const C = 2 * Math.PI * r;
  const total = slices.reduce((sum, s) => sum + Math.max(0, s.value), 0) || 1;
  const gap = slices.length > 1 ? Math.min(5, C * 0.012) : 0;

  let cursor = 0;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={r} stroke="#FFFFFF" strokeOpacity={0.05} strokeWidth={stroke} fill="none" />
        {slices.map((s) => {
          const frac = Math.max(0, s.value) / total;
          const start = cursor * C;
          cursor += frac;
          const len = Math.max(0.5, frac * C - gap);
          const isActive = activeKey === s.key;
          const dim = activeKey != null && !isActive;
          return (
            <Circle
              key={s.key}
              cx={c}
              cy={c}
              r={r}
              stroke={s.color}
              strokeOpacity={dim ? 0.35 : 0.95}
              strokeWidth={isActive ? stroke + 4 : stroke}
              fill="none"
              strokeDasharray={[len * p, C]}
              strokeDashoffset={-(start + gap / 2)}
              transform={`rotate(-90 ${c} ${c})`}
            />
          );
        })}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        {center}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center", paddingHorizontal: 36 },
});
