import type { ChartTheme } from "@tanstack/charts";
import { colorLegend } from "@tanstack/charts/legend";
import type { ColorLegendOptions } from "@tanstack/charts/legend";

import { ACCENT_VARS } from "~/types/dashboard";

const CHART_GRID_COLOR = "var(--bd2)";
const CHART_TEXT_COLOR = "var(--dim)";

export const CHART_COLORS = ACCENT_VARS;

export const CHART_THEME = {
  background: "transparent",
  foreground: "var(--tx)",
  grid: CHART_GRID_COLOR,
  muted: CHART_TEXT_COLOR,
  palette: Object.values(ACCENT_VARS),
} as const satisfies Partial<ChartTheme>;

const CHART_LEGEND_OPTIONS = {
  itemWidth: 120,
  placement: "bottom",
} as const satisfies ColorLegendOptions;

export const chartLegend = colorLegend(CHART_LEGEND_OPTIONS);
