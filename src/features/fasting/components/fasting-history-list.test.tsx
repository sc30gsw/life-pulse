// @vitest-environment happy-dom
import { expect, test, vi } from "vite-plus/test";

import type { Doc } from "~/../convex/_generated/dataModel";
import { FastingHistoryList } from "~/features/fasting/components/fasting-history-list";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  history: [] as Doc<"fastingWindows">[],
}));

vi.mock("~/features/fasting/hooks/use-fasting-history", () => ({
  useFastingHistory: () => ({ data: hookState.history }),
}));

function buildEndedWindow(overrides: Partial<Doc<"fastingWindows">> = {}): Doc<"fastingWindows"> {
  return {
    _creationTime: 0,
    _id: "fasting_1",
    actualMinutes: 500,
    endedAt: Date.UTC(2026, 6, 5, 12, 0),
    phase: "goal",
    phaseJobIds: [],
    startedAt: Date.UTC(2026, 6, 4, 20, 0), // 2026/7/5 05:00 JST
    status: "ended",
    targetMinutes: 480,
    userId: "user_1",
    ...overrides,
  } as unknown as Doc<"fastingWindows">;
}

test("shows an empty-state message when there is no fasting history", () => {
  hookState.history = [];

  const { getByText } = renderWithMantine(<FastingHistoryList />);

  expect(getByText("断食の履歴はまだありません")).toBeDefined();
});

test("renders a row per ended window with start time, actual/target minutes, and a phase chip", () => {
  hookState.history = [buildEndedWindow()];

  const { getByText } = renderWithMantine(<FastingHistoryList />);

  expect(getByText("2026/7/5 05:00")).toBeDefined();
  expect(getByText(/実績.*500分/)).toBeDefined();
  expect(getByText(/目標.*480分/)).toBeDefined();
  expect(getByText("目標達成")).toBeDefined();
});

test("renders multiple rows for multiple history entries", () => {
  hookState.history = [
    buildEndedWindow({ _id: "fasting_1" as Doc<"fastingWindows">["_id"] }),
    buildEndedWindow({
      _id: "fasting_2" as Doc<"fastingWindows">["_id"],
      phase: "early",
      startedAt: Date.UTC(2026, 6, 3, 20, 0),
    }),
  ];

  const { getByText } = renderWithMantine(<FastingHistoryList />);

  expect(getByText("2026/7/5 05:00")).toBeDefined();
  expect(getByText("2026/7/4 05:00")).toBeDefined();
  expect(getByText("空腹期")).toBeDefined();
});
