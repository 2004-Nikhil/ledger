import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LinearFill, RadialGlow } from "./Gradient";
import { PressableScale, type PressableScaleProps } from "./Pressable";
import { colors, material, radius as radii, shadow } from "./theme";

export type GlassVariant = "card" | "solid" | "float" | "flat";
export type GlowColor = keyof typeof colors.aurora;
export type GlowCorner = "tl" | "tr" | "bl" | "br" | "top";

const FILL: Record<GlassVariant, string> = {
  card: colors.glass,
  solid: colors.glassSolid,
  float: colors.dock,
  flat: "transparent",
};

export function BlurLayer({ intensity }: { intensity: number }) {
  return (
    <BlurView
      intensity={intensity}
      tint="dark"
      experimentalBlurMethod={material.androidBlur ? "dimezisBlurView" : "none"}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  );
}

/** Thin specular line along the top edge — sells the "glass edge". */
function TopHighlight({ inset = 18 }: { inset?: number }) {
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: inset, right: inset, height: 1 }}>
      <LinearFill
        from={[0, 0]}
        to={[1, 0]}
        stops={[
          { offset: 0, color: "#FFFFFF", opacity: 0 },
          { offset: 0.5, color: "#FFFFFF", opacity: 0.2 },
          { offset: 1, color: "#FFFFFF", opacity: 0 },
        ]}
      />
    </View>
  );
}

const GLOW_SIZE = 260;
function glowPlacement(corner: GlowCorner): ViewStyle {
  const o = -GLOW_SIZE * 0.42;
  switch (corner) {
    case "tl": return { top: o, left: o };
    case "tr": return { top: o, right: o };
    case "bl": return { bottom: o, left: o };
    case "br": return { bottom: o, right: o };
    case "top": return { top: o, alignSelf: "center", left: "50%", marginLeft: -GLOW_SIZE / 2 };
  }
}

export interface GlassProps extends ViewProps {
  variant?: GlassVariant;
  /** Real backdrop blur. Use on overlays; flat cards over a flat background gain nothing from it. */
  blur?: boolean;
  /** Override the variant's fill (drawn above the blur when `blur` is on). */
  tint?: string;
  glow?: GlowColor;
  glowCorner?: GlowCorner;
  glowOpacity?: number;
  radius?: number;
  padding?: number;
  /** Suppress the sheen + highlight for dense, nested surfaces. */
  quiet?: boolean;
}

export function GlassCard({
  variant = "card",
  blur = false,
  tint,
  glow,
  glowCorner = "tr",
  glowOpacity = 0.17,
  radius = radii.lg,
  padding = 0,
  quiet = false,
  style,
  children,
  ...rest
}: GlassProps) {
  const isFloat = variant === "float";
  const fill = tint ?? FILL[variant];
  return (
    <View
      {...rest}
      style={[
        {
          borderRadius: radius,
          borderWidth: StyleSheet.hairlineWidth * 1.5,
          borderColor: colors.border,
          overflow: "hidden",
          backgroundColor: blur ? "transparent" : fill,
          padding,
        },
        isFloat && shadow.float,
        style,
      ]}
    >
      {blur && (
        <>
          <BlurLayer intensity={isFloat ? material.blurIntensity.dock : material.blurIntensity.card} />
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: fill }]} />
        </>
      )}
      {!quiet && variant !== "flat" && (
        <>
          <LinearFill
            stops={[
              { offset: 0, color: "#FFFFFF", opacity: 0.06 },
              { offset: 0.5, color: "#FFFFFF", opacity: 0.012 },
              { offset: 1, color: "#FFFFFF", opacity: 0.0 },
            ]}
          />
          <TopHighlight />
        </>
      )}
      {glow && (
        <View
          pointerEvents="none"
          style={[{ position: "absolute", width: GLOW_SIZE, height: GLOW_SIZE }, glowPlacement(glowCorner)]}
        >
          <RadialGlow color={colors.aurora[glow]} opacity={glowOpacity} />
        </View>
      )}
      {children}
    </View>
  );
}

export interface GlassPressableProps extends Omit<PressableScaleProps, "style"> {
  style?: StyleProp<ViewStyle>;
  radius?: number;
  variant?: GlassVariant;
  selected?: boolean;
}

/** A glass tile that answers touch: compresses slightly and brightens its edge. */
export function GlassPressable({
  style,
  radius = radii.lg,
  variant = "card",
  selected = false,
  children,
  ...rest
}: GlassPressableProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      {...rest}
      scale={0.985}
      style={[
        {
          borderRadius: radius,
          borderWidth: StyleSheet.hairlineWidth * 1.5,
          borderColor: selected ? colors.accentBorder : colors.border,
          backgroundColor: selected ? colors.accentSoft : FILL[variant],
          overflow: "hidden",
        },
        style,
      ]}
    >
      {children}
    </PressableScale>
  );
}
