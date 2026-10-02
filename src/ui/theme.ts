/**
 * Ledger design system — Obsidian + Liquid Glass + Aurora.
 *
 * Every visual decision in the app resolves to a token in this file.
 * Screens and components never hard-code a colour, radius, or font.
 */
import { Easing, Platform, type TextStyle } from "react-native";

/* -------------------------------------------------------------------------- */
/*  Colour                                                                    */
/* -------------------------------------------------------------------------- */

export const colors = {
  // Foundations. Never pure #000.
  bg: "#080A0F",
  surface: "#0D1017",
  surfaceRaised: "#121722",

  // Glass
  glass: "rgba(255,255,255,0.055)",
  glassHover: "rgba(255,255,255,0.085)",
  glassPressed: "rgba(255,255,255,0.115)",
  glassSolid: "#10141D", // "important" surfaces that must stay readable
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.16)",
  hairline: "rgba(255,255,255,0.06)",

  // Text hierarchy — white primary, grey secondary.
  text: "#F5F7FA",
  textSecondary: "#8B93A3", // 6.4:1 on bg
  textMuted: "#737B8C", //     4.6:1 on bg — placeholders, disabled

  // Interactive = aurora blue.
  accent: "#4F7CFF",
  accentText: "#8FAEFF", // accent for small text (7:1 on bg)
  accentSoft: "rgba(79,124,255,0.16)",
  accentBorder: "rgba(79,124,255,0.42)",

  // Semantic movement — emerald and coral only mean something.
  positive: "#34D399",
  positiveSoft: "rgba(52,211,153,0.13)",
  positiveBorder: "rgba(52,211,153,0.34)",
  negative: "#FF6B7A",
  negativeSoft: "rgba(255,107,122,0.13)",
  negativeBorder: "rgba(255,107,122,0.34)",

  // Lighting (used only at very low opacity behind glass).
  aurora: {
    blue: "#4F7CFF",
    green: "#35E6A4",
    violet: "#8B5CF6",
    cyan: "#45D9FF",
  },

  scrim: "rgba(4,5,9,0.66)",
  dock: "rgba(12,15,23,0.66)",
  sheet: "rgba(13,16,23,0.9)",
} as const;

/** Category / series palette — tuned to sit on obsidian without vibrating. */
export const seriesPalette = [
  "#4F7CFF",
  "#35E6A4",
  "#8B5CF6",
  "#45D9FF",
  "#F2B45A",
  "#FF6B7A",
  "#A9B8FF",
  "#7DD3B0",
  "#C4A7FF",
  "#8CC8E8",
] as const;

export function seriesColor(index: number): string {
  return seriesPalette[index % seriesPalette.length];
}

/* -------------------------------------------------------------------------- */
/*  Typography                                                                */
/* -------------------------------------------------------------------------- */

// Loaded in app/_layout.tsx via @expo-google-fonts/manrope.
export const fonts = {
  light: "Manrope_300Light",
  regular: "Manrope_400Regular",
  medium: "Manrope_500Medium",
  semibold: "Manrope_600SemiBold",
  bold: "Manrope_700Bold",
} as const;

const tabular: TextStyle["fontVariant"] = ["tabular-nums"];

export const type = {
  /** Hero financial values — light weight, large, quiet. */
  display: { fontFamily: fonts.light, fontSize: 46, lineHeight: 52, letterSpacing: -1.4, fontVariant: tabular },
  hero: { fontFamily: fonts.light, fontSize: 36, lineHeight: 42, letterSpacing: -1, fontVariant: tabular },
  figure: { fontFamily: fonts.regular, fontSize: 24, lineHeight: 30, letterSpacing: -0.5, fontVariant: tabular },
  figureSm: { fontFamily: fonts.medium, fontSize: 18, lineHeight: 24, letterSpacing: -0.3, fontVariant: tabular },

  title: { fontFamily: fonts.semibold, fontSize: 30, lineHeight: 36, letterSpacing: -0.8 },
  heading: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24, letterSpacing: -0.25 },
  subheading: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, letterSpacing: -0.1 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  captionStrong: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  micro: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.1 },
  amount: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, fontVariant: tabular },
} as const satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;

/* -------------------------------------------------------------------------- */
/*  Space, shape, layout                                                      */
/* -------------------------------------------------------------------------- */

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, huge: 48 } as const;

export const radius = { sm: 12, md: 16, lg: 22, xl: 28, dock: 24, pill: 999 } as const;

export const layout = {
  /** Content never stretches wider than this, even on tablets / landscape. */
  maxContentWidth: 760,
  dockMaxWidth: 420,
  minTouch: 44,
  breakpoints: { compact: 360, wide: 600 },
} as const;

/* -------------------------------------------------------------------------- */
/*  Motion — short, smooth, purposeful. No springs, no bounce.                */
/* -------------------------------------------------------------------------- */

export const motion = {
  fast: 140,
  base: 240,
  slow: 420,
  chart: 1000,
  count: 780,
  drift: 26000,
  pressScale: 0.975, // 2.5% compression
  easeOut: Easing.bezier(0.22, 1, 0.36, 1),
  easeInOut: Easing.bezier(0.65, 0, 0.35, 1),
} as const;

/* -------------------------------------------------------------------------- */
/*  Material                                                                  */
/* -------------------------------------------------------------------------- */

export const material = {
  blurIntensity: { dock: 45, sheet: 60, card: 28 },
  /**
   * expo-blur's Android backdrop blur is marked experimental (it can cost
   * performance on low-end devices). Off by default: Android gets the same
   * frosted material via a slightly denser tint. Flip to true to opt in.
   */
  androidBlur: false,
  grainOpacity: 0.035,
} as const;

export const shadow = {
  float: Platform.select({
    ios: {
      shadowColor: "#000814",
      shadowOpacity: 0.5,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 14 },
    },
    default: {},
  }),
  glow: (color: string) =>
    Platform.select({
      ios: { shadowColor: color, shadowOpacity: 0.55, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } },
      default: {},
    }),
} as const;
