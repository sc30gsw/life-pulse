// @vitest-environment happy-dom
import { expect, test, vi } from "vite-plus/test";

import type { Id } from "~/../convex/_generated/dataModel";
import {
  SessionHistoryList,
  SessionHistoryListFallback,
} from "~/features/study/components/session-history-list";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  toeicCategoryId: "category_toeic" as Id<"studyCategories">,
  days: [] as {
    dateJst: string;
    sessions: {
      actualMinutes: number;
      categoryId: Id<"studyCategories">;
      id: string;
      interruptionCount: number;
      reasons: ("chore" | "dog" | "other" | "work")[];
      startedAt: number;
      status: "abandoned" | "active" | "completed" | "paused";
    }[];
  }[],
}));

vi.mock("~/features/study/hooks/use-session-history", () => ({
  useSessionHistory: () => ({ days: hookState.days }),
}));

vi.mock("~/features/study-categories/hooks/use-study-categories-query", () => ({
  useStudyCategoriesQuery: () => ({
    categoryName: (categoryId: Id<"studyCategories"> | undefined) =>
      categoryId === hookState.toeicCategoryId ? "TOEIC" : "カテゴリ未設定",
  }),
}));

test("shows 履歴なし when there are no past sessions", () => {
  hookState.days = [];

  const { getByText } = renderWithMantine(<SessionHistoryList />);

  expect(getByText("履歴なし")).toBeDefined();
});

test("renders sessions grouped by date with category, minutes, and status", () => {
  hookState.days = [
    {
      dateJst: "2026-07-05",
      sessions: [
        {
          actualMinutes: 30,
          categoryId: hookState.toeicCategoryId,
          id: "session_1",
          interruptionCount: 3,
          reasons: ["dog", "dog", "work"],
          startedAt: Date.UTC(2026, 6, 5, 21, 0), // 06:00 JST
          status: "completed",
        },
      ],
    },
  ];

  const { getByText } = renderWithMantine(<SessionHistoryList />);

  expect(getByText("2026-07-05")).toBeDefined();
  expect(getByText("TOEIC")).toBeDefined();
  expect(getByText("30分")).toBeDefined();
  expect(getByText(/中断 3 回/)).toBeDefined();
  expect(getByText(/犬×2 · 仕事×1/)).toBeDefined();
  expect(getByText("完了")).toBeDefined();
});

test("renders a structure-aware shimmer fallback", () => {
  const { getAllByText } = renderWithMantine(<SessionHistoryListFallback />);

  expect(getAllByText("TOEIC").length).toBeGreaterThan(0);
});
