import { type ReactNode } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useDrawProgress } from "../hooks";
import { motion } from "../theme";

const TONES = { accent: "#4F7CFF", positive: "#35E6A4", negative: "#FF6B7A" } as const;

/** Small progress ring with a soft glow — goals, budgets. `value` is 0..1. */
export function Ring({
  value,
  size = 60,
  stroke = 5,
  tone = "accent",
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: keyof typeof TONES;
  children?: ReactNode;
}) {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const p = useDrawProgress(clamped, motion.chart);
  const r = (size - stroke) / 2 - 2;
  const c = size / 2;
  const C = 2 * Math.PI * r;
  const color = TONES[tone];

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={r} stroke="#FFFFFF" strokeOpacity={0.07} strokeWidth={stroke} fill="none" />
        {clamped > 0 && (
          <>
            <Circle cx={c} cy={c} r={r} stroke={color} strokeOpacity={0.18} strokeWidth={stroke + 5} fill="none" strokeLinecap="round" strokeDasharray={[C * clamped * p, C]} transform={`rotate(-90 ${c} ${c})`} />
            <Circle cx={c} cy={c} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={[C * clamped * p, C]} transform={`rotate(-90 ${c} ${c})`} />
          </>
        )}
      </Svg>
      <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>{children}</View>
    </View>
  );
}
