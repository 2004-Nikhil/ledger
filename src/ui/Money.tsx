import { type StyleProp, type TextStyle } from "react-native";
import { Text, toneColor, type Tone } from "./Text";
import { moneyParts, money as formatMoney } from "./format";
import { useCountUp } from "./hooks";
import { motion, type, type TypeVariant } from "./theme";

type MoneySize = Extract<TypeVariant, "display" | "hero" | "figure" | "figureSm" | "amount">;

const SUB_SCALE: Record<MoneySize, { symbol: number; fraction: number }> = {
  display: { symbol: 0.5, fraction: 0.5 },
  hero: { symbol: 0.52, fraction: 0.52 },
  figure: { symbol: 0.62, fraction: 0.62 },
  figureSm: { symbol: 0.75, fraction: 0.75 },
  amount: { symbol: 0.86, fraction: 0.86 },
};

export interface MoneyTextProps {
  amount: number;
  size?: MoneySize;
  /** White by default. Use positive / negative only where the movement is the point. */
  tone?: Tone;
  /** Count up from zero on mount and glide between values. Reserve for hero figures. */
  animate?: boolean;
  decimals?: number;
  /** Always prefix + or − (for gains, deltas, transaction rows). */
  signed?: boolean;
  /** Force a specific sign (for amounts stored as positive numbers, e.g. an expense). */
  sign?: "+" | "\u2212";
  /** Dim the currency symbol and fraction so the whole figure leads. */
  quietParts?: boolean;
  align?: "left" | "center" | "right";
  style?: StyleProp<TextStyle>;
}

/**
 * The app's financial figure. Whole number leads at full size; the currency
 * symbol and paise sit smaller and quieter — like the sub-dial of a watch.
 * Shrinks to fit instead of clipping when a value is unusually large.
 */
export function MoneyText({
  amount,
  size = "figure",
  tone = "primary",
  animate = false,
  decimals = 2,
  signed = false,
  sign: signOverride,
  quietParts = true,
  align,
  style,
}: MoneyTextProps) {
  const counted = useCountUp(animate ? amount : 0, motion.count);
  const shown = animate ? counted : amount;
  const p = moneyParts(shown, decimals);
  const scale = SUB_SCALE[size];
  const base = type[size].fontSize;

  const partStyle = (factor: number): TextStyle => ({
    fontSize: Math.round(base * factor),
    ...(tone === "primary" && quietParts ? { color: toneColor.secondary } : null),
  });

  const sign = signOverride ?? (p.negative ? "\u2212" : signed ? "+" : "");
  const label = `${sign}${formatMoney(Math.abs(amount), decimals)}`;

  return (
    <Text
      variant={size}
      tone={tone}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.55}
      accessibilityLabel={label}
      style={[align ? { textAlign: align } : null, style]}
    >
      {sign}
      <Text variant={size} tone={tone} style={partStyle(scale.symbol)}>
        {p.symbol}
      </Text>
      {p.whole}
      {p.fraction ? (
        <Text variant={size} tone={tone} style={partStyle(scale.fraction)}>
          {p.fraction}
        </Text>
      ) : null}
    </Text>
  );
}
