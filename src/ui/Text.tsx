import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { colors, type, type TypeVariant } from "./theme";

export type Tone = "primary" | "secondary" | "muted" | "accent" | "positive" | "negative";

export const toneColor: Record<Tone, string> = {
  primary: colors.text,
  secondary: colors.textSecondary,
  muted: colors.textMuted,
  accent: colors.accentText,
  positive: colors.positive,
  negative: colors.negative,
};

export interface TextProps extends RNTextProps {
  variant?: TypeVariant;
  tone?: Tone;
}

/**
 * The only text primitive in the app. Caps system font scaling at 130% so
 * large-text accessibility settings help readers without breaking layouts.
 */
export function Text({ variant = "body", tone = "primary", style, maxFontSizeMultiplier = 1.3, ...rest }: TextProps) {
  return (
    <RNText
      {...rest}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[type[variant], { color: toneColor[tone] }, style]}
    />
  );
}
