// Shared ECharts styling so the dashboard's line/area charts (the big weekly
// overview chart and the small per-card sparklines) stay visually consistent
// without each component re-declaring the same gradient/tooltip config.

// ECharts/zrender only understand literal color formats they can parse
// themselves (hex, rgb/rgba, hsl/hsla) — not CSS `var()` or `color-mix()`.
// Those work for the initial paint (the SVG renderer writes the string
// straight into a DOM attribute and the browser resolves it), but break the
// moment ECharts computes a color itself, which it does for the hover/
// emphasis state on a series. That silently fails to parse and leaves the
// shape uncolored, and doesn't self-heal on mouse-out — only a fresh mount
// repaints it. Resolve the custom property to a literal rgb() once so every
// state ECharts derives from it (including hover) stays valid.
let cachedAccentRgb: string | null = null;

function chartAccentRgb(): string {
  if (cachedAccentRgb) return cachedAccentRgb;
  if (typeof window === "undefined") return "rgb(222, 222, 222)";
  const probe = document.createElement("span");
  probe.style.color = "var(--chart-1)";
  document.body.appendChild(probe);
  cachedAccentRgb = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  return cachedAccentRgb;
}

function withAlpha(rgb: string, alpha: number) {
  const channels = rgb.match(/[\d.]+/g)?.slice(0, 3).join(", ") ?? "0, 0, 0";
  return `rgba(${channels}, ${alpha})`;
}

export function areaGradient(opacity: number) {
  const accent = chartAccentRgb();
  return {
    type: "linear" as const,
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: withAlpha(accent, opacity) },
      { offset: 1, color: withAlpha(accent, 0) },
    ],
  };
}

export function areaLineSeries(
  data: number[],
  options?: { name?: string; areaOpacity?: number; disableEmphasis?: boolean }
) {
  const accent = chartAccentRgb();
  return {
    name: options?.name,
    type: "line" as const,
    data,
    smooth: 0.4,
    symbol: "circle" as const,
    showSymbol: false,
    symbolSize: 6,
    lineStyle: { width: 2, color: accent },
    itemStyle: { color: accent },
    areaStyle: { color: areaGradient(options?.areaOpacity ?? 0.4) },
    // The gradient areaStyle isn't a plain color, and ECharts' hover/emphasis
    // state tries to derive a highlighted variant of the series style — for a
    // gradient that derivation breaks and blanks the shape until the pointer
    // leaves. These sparklines are decorative trend lines with no symbols or
    // axis of their own, so there's nothing worth emphasizing on hover anyway.
    ...(options?.disableEmphasis ? { emphasis: { disabled: true } } : {}),
  };
}

export const tooltipTheme = {
  borderWidth: 1,
  borderColor: "var(--border)",
  backgroundColor: "var(--popover)",
  borderRadius: 8,
};
