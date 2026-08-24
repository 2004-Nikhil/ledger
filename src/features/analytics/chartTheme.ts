export interface ChartTheme {
  backgroundGradientFrom: string;
  backgroundGradientTo: string;
  decimalPlaces: number;
  color: (opacity?: number) => string;
  labelColor: (opacity?: number) => string;
  propsForDots?: { r?: string };
  propsForBackgroundLines?: { stroke?: string };
}

export const chartTheme: ChartTheme = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
  propsForDots: { r: "4" },
  propsForBackgroundLines: { stroke: "#e5e7eb" },
};

/** A small fixed palette, cycled by index — good enough for a personal category list. */
export const CATEGORY_PALETTE = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#9333ea",
  "#f59e0b",
  "#0891b2",
  "#db2777",
  "#65a30d",
  "#7c3aed",
  "#ea580c",
];

export function paletteColor(index: number): string {
  return CATEGORY_PALETTE[index % CATEGORY_PALETTE.length];
}