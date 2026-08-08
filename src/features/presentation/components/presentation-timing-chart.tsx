import { barX, defineChart } from "@tanstack/charts";
import { scaleBand } from "@tanstack/charts-scales/band";
import { scaleLinear } from "@tanstack/charts-scales/linear";
import { scaleOrdinal } from "@tanstack/charts-scales/ordinal";
import { tooltip } from "@tanstack/charts/tooltip";
import { Chart } from "@tanstack/react-charts";

const SECTION_TIMING = [
  { accent: "導入", minutes: 4, section: "導入" },
  { accent: "Database", minutes: 20, section: "Database" },
  { accent: "理解", minutes: 1, section: "Checkpoint 1" },
  { accent: "Realtime", minutes: 15, section: "Functions / Realtime" },
  { accent: "Demo", minutes: 8, section: "Life Pulse Demo" },
  { accent: "Production", minutes: 11, section: "本番機能" },
  { accent: "理解", minutes: 1, section: "Checkpoint 2" },
  { accent: "Optional", minutes: 12, section: "Components / AI / Ops" },
  { accent: "Adoption", minutes: 10, section: "採用判断" },
  { accent: "Q&A", minutes: 8, section: "Q&A" },
] as const;

const chartDefinition = defineChart({
  color: {
    scale: () =>
      scaleOrdinal<string, string>()
        .domain([
          "導入",
          "Database",
          "理解",
          "Realtime",
          "Demo",
          "Production",
          "Optional",
          "Adoption",
          "Q&A",
        ])
        .range([
          "var(--dim)",
          "var(--good)",
          "var(--amber)",
          "var(--blue)",
          "var(--coral)",
          "var(--amber)",
          "var(--violet)",
          "var(--blue)",
          "var(--dim)",
        ]),
  },
  marks: [barX(SECTION_TIMING, { color: "accent", x: "minutes", y: "section" })],
  theme: {
    background: "transparent",
    foreground: "var(--tx)",
    grid: "var(--bd2)",
    muted: "var(--dim)",
  },
  tooltip,
  x: {
    axis: { label: "minutes" },
    grid: true,
    nice: true,
    scale: scaleLinear,
  },
  y: { scale: () => scaleBand<string>().padding(0.16) },
});

export function PresentationTimingChart() {
  return (
    <div className="min-w-0" data-chart-engine="tanstack">
      <Chart
        ariaDescription="Database章が20分で最長。全10区間の合計は90分です。"
        ariaLabel="Convexプレゼンテーションの時間配分"
        definition={chartDefinition}
        height={250}
        initialWidth={560}
      />
    </div>
  );
}
