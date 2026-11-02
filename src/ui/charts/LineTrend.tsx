import { useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from "react-native-svg";
import { useSvgId } from "../Gradient";
import { useDrawProgress } from "../hooks";
import { Text } from "../Text";
import { colors, motion, radius } from "../theme";
import { areaPath, labelStride, monotonePath, nearestIndex } from "./chartMath";

export interface TrendDatum {
  label: string;
  value: number;
}

const TONES = {
  accent: { from: "#4F7CFF", to: "#45D9FF", glow: "#4F7CFF" },
  positive: { from: "#2BBF88", to: "#35E6A4", glow: "#35E6A4" },
  negative: { from: "#FF6B7A", to: "#FF9A8A", glow: "#FF6B7A" },
  violet: { from: "#8B5CF6", to: "#A9B8FF", glow: "#8B5CF6" },
} as const;

export interface LineTrendProps {
  data: TrendDatum[];
  height?: number;
  tone?: keyof typeof TONES;
  /** Anchor the baseline at zero (spending trends) instead of fitting the range (balances). */
  fromZero?: boolean;
  formatValue: (value: number) => string;
  onActiveChange?: (index: number | null) => void;
}

const PAD = { t: 26, b: 30, l: 16, r: 16 };

/**
 * A floating trail of light: hairline glowing stroke, a whisper of gradient
 * beneath, an almost invisible grid, and a soft halo on the current point.
 * Touch or drag to read any point.
 */
export function LineTrend({ data, height = 168, tone = "accent", fromZero = false, formatValue, onActiveChange }: LineTrendProps) {
  const [w, setW] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = TONES[tone];
  const areaId = useSvgId("la");
  const strokeId = useSvgId("ls");

  const signature = data.map((d) => d.value).join("|");
  const p = useDrawProgress(signature, motion.chart);

  const geo = useMemo(() => {
    if (w <= 0 || data.length === 0) return null;
    const plotW = w - PAD.l - PAD.r;
    const plotH = height - PAD.t - PAD.b;
    const values = data.map((d) => d.value);
    let lo = Math.min(...values);
    let hi = Math.max(...values);
    if (fromZero) {
      lo = Math.min(0, lo);
      if (hi <= lo) hi = lo + 1;
    } else {
      const span = hi - lo;
      const pad = span === 0 ? Math.max(1, Math.abs(hi) * 0.1) : span * 0.14;
      lo -= pad;
      hi += pad;
    }
    const yOf = (v: number) => PAD.t + plotH * (1 - (v - lo) / (hi - lo));
    const xs = data.map((_, i) => (data.length === 1 ? PAD.l + plotW / 2 : PAD.l + (plotW * i) / (data.length - 1)));
    const pts = data.map((d, i) => ({ x: xs[i], y: yOf(d.value) }));
    const line = monotonePath(pts);
    const baseline = PAD.t + plotH;
    const area = pts.length > 1 ? areaPath(line.d, pts[0], pts[pts.length - 1], baseline) : "";
    return { plotW, plotH, xs, pts, line, area, baseline };
  }, [w, height, data, fromZero]);

  useEffect(
    () => () => {
      if (clearTimer.current) clearTimeout(clearTimer.current);
    },
    []
  );

  const select = (x: number) => {
    if (!geo) return;
    const i = nearestIndex(x, geo.xs);
    setActive(i);
    onActiveChange?.(i);
  };
  const scheduleClear = () => {
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => {
      setActive(null);
      onActiveChange?.(null);
    }, 2400);
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          if (clearTimer.current) clearTimeout(clearTimer.current);
          select(e.nativeEvent.locationX);
        },
        onPanResponderMove: (e) => select(e.nativeEvent.locationX),
        onPanResponderRelease: scheduleClear,
        onPanResponderTerminate: scheduleClear,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [geo]
  );

  if (data.length === 0) return null;

  const first = data[0];
  const last = data[data.length - 1];
  const summary = `Trend from ${first.label}, ${formatValue(first.value)}, to ${last.label}, ${formatValue(last.value)}.`;
  const stride = geo ? labelStride(data.length, geo.plotW) : 1;
  const revealEnd = Math.max(0, Math.min(1, (p - 0.8) / 0.2));

  return (
    <View
      style={{ height }}
      onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))}
      accessible
      accessibilityRole="image"
      accessibilityLabel={summary}
    >
      {geo && (
        <>
          <Svg width={w} height={height}>
            <Defs>
              <LinearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={t.glow} stopOpacity={0.17} />
                <Stop offset="1" stopColor={t.glow} stopOpacity={0} />
              </LinearGradient>
              <LinearGradient id={strokeId} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={t.from} stopOpacity={0.75} />
                <Stop offset="1" stopColor={t.to} stopOpacity={1} />
              </LinearGradient>
            </Defs>

            {[0, 0.5, 1].map((f) => (
              <Line
                key={f}
                x1={PAD.l}
                x2={w - PAD.r}
                y1={PAD.t + geo.plotH * f}
                y2={PAD.t + geo.plotH * f}
                stroke="#FFFFFF"
                strokeOpacity={0.045}
                strokeWidth={1}
              />
            ))}

            {geo.area ? <Path d={geo.area} fill={`url(#${areaId})`} opacity={p} /> : null}

            {geo.pts.length > 1 && (
              <>
                {/* soft luminous underlay */}
                <Path d={geo.line.d} stroke={t.glow} strokeOpacity={0.09} strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray={p < 1 ? [geo.line.length, geo.line.length] : undefined} strokeDashoffset={geo.line.length * (1 - p)} />
                <Path d={geo.line.d} stroke={t.glow} strokeOpacity={0.16} strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray={p < 1 ? [geo.line.length, geo.line.length] : undefined} strokeDashoffset={geo.line.length * (1 - p)} />
                <Path d={geo.line.d} stroke={`url(#${strokeId})`} strokeWidth={1.75} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={p < 1 ? [geo.line.length, geo.line.length] : undefined} strokeDashoffset={geo.line.length * (1 - p)} />
              </>
            )}

            {active !== null && (
              <Line x1={geo.xs[active]} x2={geo.xs[active]} y1={PAD.t - 6} y2={geo.baseline} stroke="#FFFFFF" strokeOpacity={0.16} strokeWidth={1} strokeDasharray={[3, 4]} />
            )}

            {/* current value — halo + core */}
            {(() => {
              const i = active ?? geo.pts.length - 1;
              const pt = geo.pts[i];
              const isCurrent = active === null;
              const o = isCurrent ? revealEnd : 1;
              return (
                <>
                  <Circle cx={pt.x} cy={pt.y} r={17} fill={t.glow} fillOpacity={0.07 * o} />
                  <Circle cx={pt.x} cy={pt.y} r={10} fill={t.glow} fillOpacity={0.15 * o} />
                  <Circle cx={pt.x} cy={pt.y} r={3.6} fill="#F5F7FA" stroke={t.to} strokeWidth={1.5} opacity={o} />
                </>
              );
            })()}
          </Svg>

          {data.map((d, i) =>
            i % stride === 0 || i === data.length - 1 ? (
              <Text
                key={`${d.label}-${i}`}
                variant="micro"
                tone={active === i ? "primary" : "muted"}
                numberOfLines={1}
                style={{ position: "absolute", bottom: 4, width: 44, left: geo.xs[i] - 22, textAlign: "center" }}
              >
                {d.label}
              </Text>
            ) : null
          )}

          {active !== null && <Tooltip x={geo.xs[active]} width={w} label={d2(data[active])} value={formatValue(data[active].value)} />}

          <View style={StyleSheet.absoluteFill} {...responder.panHandlers} />
        </>
      )}
    </View>
  );
}

const d2 = (d: TrendDatum) => d.label;

/** Compact frosted read-out that rides above the touched point. */
export function Tooltip({ x, width, label, value }: { x: number; width: number; label: string; value: string }) {
  const TW = 118;
  const left = Math.max(4, Math.min(width - TW - 4, x - TW / 2));
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left,
        width: TW,
        paddingVertical: 4,
        borderRadius: radius.pill,
        alignItems: "center",
        backgroundColor: "rgba(18,23,34,0.92)",
        borderWidth: StyleSheet.hairlineWidth * 1.5,
        borderColor: colors.borderStrong,
      }}
    >
      <Text variant="captionStrong" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
        {value}
      </Text>
      <Text variant="micro" tone="secondary" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
