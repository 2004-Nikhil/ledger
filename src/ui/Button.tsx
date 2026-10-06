import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { PressableScale } from "./Pressable";
import { LinearFill } from "./Gradient";
import { Text, toneColor, type Tone } from "./Text";
import { colors, radius } from "./theme";

export type IconName = ComponentProps<typeof Ionicons>["name"];
export type ButtonVariant = "primary" | "glass" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const HEIGHT: Record<ButtonSize, number> = { sm: 40, md: 50, lg: 56 };
const PAD: Record<ButtonSize, number> = { sm: 16, md: 22, lg: 26 };

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const inactive = disabled || loading;
  const isPrimary = variant === "primary";
  const textTone: Tone = variant === "ghost" ? "accent" : "primary";

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      hitSlop={size === "sm" ? { top: 2, bottom: 2 } : undefined}
      style={[
        fullWidth ? { alignSelf: "stretch" } : { alignSelf: "flex-start" },
        {
          minHeight: HEIGHT[size],
          paddingHorizontal: PAD[size],
          borderRadius: radius.pill,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderWidth: variant === "ghost" ? 0 : StyleSheet.hairlineWidth * 1.5,
          borderColor: isPrimary ? colors.accentBorder : colors.border,
          backgroundColor: isPrimary ? "rgba(79,124,255,0.26)" : variant === "glass" ? colors.glass : "transparent",
          opacity: disabled && !loading ? 0.45 : 1,
        },
        style,
      ]}
    >
      {isPrimary && (
        <LinearFill
          stops={[
            { offset: 0, color: "#9DB6FF", opacity: 0.22 },
            { offset: 1, color: colors.accent, opacity: 0.04 },
          ]}
        />
      )}
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator size="small" color={toneColor.primary} />
        ) : icon ? (
          <Ionicons name={icon} size={size === "sm" ? 16 : 18} color={toneColor[textTone]} />
        ) : null}
        <Text variant={size === "sm" ? "captionStrong" : "bodyStrong"} tone={textTone} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

export interface IconButtonProps {
  icon: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
  size?: number;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

/** A 44pt circular glass control. */
export function IconButton({ icon, onPress, accessibilityLabel, size = 44, tone = "primary", style, disabled }: IconButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: StyleSheet.hairlineWidth * 1.5,
          borderColor: colors.border,
          backgroundColor: colors.glass,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={Math.round(size * 0.44)} color={toneColor[tone]} />
    </PressableScale>
  );
}

export type PillTone = "neutral" | "accent" | "positive" | "negative" | "violet";
const PILL: Record<PillTone, { bg: string; border: string; text: Tone | "violet" }> = {
  neutral: { bg: colors.glass, border: colors.border, text: "secondary" },
  accent: { bg: colors.accentSoft, border: colors.accentBorder, text: "accent" },
  positive: { bg: colors.positiveSoft, border: colors.positiveBorder, text: "positive" },
  negative: { bg: colors.negativeSoft, border: colors.negativeBorder, text: "negative" },
  violet: { bg: "rgba(139,92,246,0.14)", border: "rgba(139,92,246,0.38)", text: "violet" },
};

/** Small non-interactive status label. */
export function Pill({ label, tone = "neutral", icon }: { label: string; tone?: PillTone; icon?: IconName }) {
  const t = PILL[tone];
  const color = t.text === "violet" ? "#B9A2FF" : toneColor[t.text];
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: radius.pill,
        backgroundColor: t.bg,
        borderWidth: StyleSheet.hairlineWidth * 1.5,
        borderColor: t.border,
      }}
    >
      {icon && <Ionicons name={icon} size={12} color={color} />}
      <Text variant="micro" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
});
