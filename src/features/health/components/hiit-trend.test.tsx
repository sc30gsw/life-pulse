// @vitest-environment happy-dom
import type { ReactNode } from "react";
import { expect, test, vi } from "vite-plus/test";

import type { Doc } from "~/../convex/_generated/dataModel";
import { HiitTrend, HiitTrendFallback } from "~/features/health/components/hiit-trend";
import { hiitTrendRangeJst } from "~/features/health/utils/hiit-trend";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  workouts: [] as Doc<"workouts">[],
}));

vi.mock("~/features/health/hooks/use-workouts", () => ({
  useWorkouts: () => ({ data: hookState.workouts }),
}));

vi.mock("@mantine/charts", () => ({
  BarChart: ({ data, series }: { data: unknown[]; series: Array<{ name: string }> }) => (
    <div
      data-first-row={JSON.stringify(data[0])}
      data-series={series.map((item) => item.name).join(",")}
      data-testid="bar-chart"
    >
      rows:{data.length}
    </div>
  ),
}));

vi.mock("@shimmer-from-structure/react", () => ({
  Shimmer: ({ children }: { children: ReactNode }) => <div data-testid="shimmer">{children}</div>,
}));

function buildWorkout(overrides: Partial<Doc<"workouts">> = {}): Doc<"workouts"> {
  return {
    _creationTime: 0,
    _id: "workout_1",
    at: Date.UTC(2026, 6, 8, 11, 0, 0),
    dateJst: "2026-07-08",
    durationMinutes: 30,
    kind: "hiit",
    ...overrides,
  } as unknown as Doc<"workouts">;
}

test("shows an empty state when there are no workouts", () => {
  hookState.workouts = [];

  const { getByText } = renderWithMantine(<HiitTrend />);

  expect(getByText("トレーニングの記録はまだありません")).toBeDefined();
  expect(getByText("直近14日間のHIIT記録がありません")).toBeDefined();
});

test("renders a bucketed bar chart from workout rows", () => {
  const { toDateJst } = hiitTrendRangeJst();
  hookState.workouts = [
    buildWorkout({ dateJst: toDateJst, durationMinutes: 20 }),
    buildWorkout({ dateJst: toDateJst, durationMinutes: 15 }),
  ];

  const { getByTestId } = renderWithMantine(<HiitTrend />);
  const chart = getByTestId("bar-chart");

  expect(chart.getAttribute("data-series")).toBe("durationMinutes");
  expect(chart.textContent).toBe("rows:14");
  expect(chart.getAttribute("data-first-row")).toContain('"durationMinutes":0');
});

test("renders chart fallback placeholder", () => {
  const { getByTestId } = renderWithMantine(<HiitTrendFallback />);

  expect(getByTestId("shimmer")).toBeDefined();
});
