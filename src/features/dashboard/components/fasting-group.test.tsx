// @vitest-environment happy-dom
import { expect, test, vi } from "vite-plus/test";

import type { Doc } from "~/../convex/_generated/dataModel";
import { FastingGroup, FastingGroupFallback } from "~/features/dashboard/components/fasting-group";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  fasting: null as Doc<"fastingWindows"> | null,
}));

vi.mock("~/features/dashboard/hooks/use-dashboard-fasting", () => ({
  useDashboardFasting: () => ({
    fasting: hookState.fasting,
    fastingElapsedLabel: "6h42m",
    fastingRemainLabel: "9h18m",
    fastingRingPercent: 42,
  }),
}));

function buildFasting(overrides: Partial<Doc<"fastingWindows">> = {}): Doc<"fastingWindows"> {
  return {
    _creationTime: 0,
    _id: "fasting_1",
    phase: "early",
    phaseJobIds: [],
    startedAt: 0,
    status: "fasting",
    targetMinutes: 960,
    userId: "user_1",
    ...overrides,
  } as unknown as Doc<"fastingWindows">;
}

test("renders 未開始 when there is no active fasting window", () => {
  hookState.fasting = null;

  const { getByText } = renderWithMantine(<FastingGroup fastingFlash={false} />);

  expect(getByText("未開始")).toBeDefined();
  expect(getByText("断食を開始していません")).toBeDefined();
});

test("renders fatburn and goal fasting phases", () => {
  hookState.fasting = buildFasting({ phase: "fatburn" });

  const fatburn = renderWithMantine(<FastingGroup fastingFlash={false} />);
  expect(fatburn.getByText("脂肪燃焼帯")).toBeDefined();
  expect(fatburn.getByText("16hで目標達成")).toBeDefined();
  fatburn.unmount();

  hookState.fasting = buildFasting({ phase: "goal" });

  const goal = renderWithMantine(<FastingGroup fastingFlash={false} />);
  expect(goal.getByText("目標達成")).toBeDefined();
  expect(goal.getByText("16時間クリア")).toBeDefined();
});

test("renders a structure-aware shimmer fallback", () => {
  const { getByText } = renderWithMantine(<FastingGroupFallback />);

  expect(getByText("断食")).toBeDefined();
  expect(getByText("空腹期")).toBeDefined();
});
