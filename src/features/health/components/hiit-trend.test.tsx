// @vitest-environment happy-dom
import type { ReactNode } from "react";
import { expect, test, vi } from "vite-plus/test";

import type { Doc } from "~/../convex/_generated/dataModel";
import { HiitTrend, HiitTrendFallback } from "~/features/health/components/hiit-trend";
import { HIIT_TREND_DAYS, hiitTrendRangeJst } from "~/features/health/utils/hiit-trend";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  workouts: [] as Doc<"workouts">[],
}));

vi.mock("~/features/health/hooks/use-workouts", () => ({
  useWorkouts: () => ({ data: hookState.workouts }),
}));

vi.mock("~/components/charts/tanstack-chart", () => ({
  TanStackChart: ({ ariaLabel }: { ariaLabel: string }) => (
    <div data-label={ariaLabel} data-testid="tanstack-chart" />
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
  expect(getByText(`直近${HIIT_TREND_DAYS}日間のトレーニング記録がありません`)).toBeDefined();
});

test("renders a bucketed, kind-split stacked bar chart from workout rows", () => {
  const { toDateJst } = hiitTrendRangeJst();
  hookState.workouts = [
    buildWorkout({ dateJst: toDateJst, durationMinutes: 20, kind: "hiit" }),
    buildWorkout({ dateJst: toDateJst, durationMinutes: 15, kind: "walk" }),
  ];

  const { getByTestId } = renderWithMantine(<HiitTrend />);
  const chart = getByTestId("tanstack-chart");

  expect(chart.getAttribute("data-label")).toBe("トレーニング時間の内訳");
});

test("renders chart fallback placeholder", () => {
  const { getByTestId } = renderWithMantine(<HiitTrendFallback />);

  expect(getByTestId("shimmer")).toBeDefined();
});
