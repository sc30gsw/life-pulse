// @vitest-environment happy-dom
import { expect, test, vi } from "vite-plus/test";

import type { Doc, Id } from "~/../convex/_generated/dataModel";
import { BlockListItem } from "~/features/study/components/block-list-item";
import { renderWithMantine } from "~/test-utils";

const categoryState = vi.hoisted(() => ({
  toeicCategoryId: "category_toeic" as Id<"studyCategories">,
}));

vi.mock("~/features/study-categories/hooks/use-study-categories-query", () => ({
  useStudyCategoriesQuery: () => ({
    categoryName: (categoryId: Id<"studyCategories"> | undefined) =>
      categoryId === categoryState.toeicCategoryId ? "TOEIC" : "カテゴリ未設定",
  }),
}));

function buildBlock(overrides: Partial<Doc<"studyBlocks">> = {}): Doc<"studyBlocks"> {
  return {
    _creationTime: 0,
    _id: "block_1",
    categoryId: categoryState.toeicCategoryId,
    dateJst: "2026-07-07",
    endHm: "07:00",
    plannedMinutes: 60,
    source: "manual",
    startHm: "06:00",
    status: "planned",
    userId: "user_1",
    ...overrides,
  } as unknown as Doc<"studyBlocks">;
}

test("BlockListItem renders an eroded block without reschedule suggestions", () => {
  const { getByText } = renderWithMantine(
    <BlockListItem
      block={buildBlock({ erosionReason: "work", status: "eroded" })}
      erodingBlockId={null}
      onDecline={vi.fn()}
      onErode={vi.fn()}
      onReschedule={vi.fn()}
      onStartFromBlock={vi.fn()}
      onToggleErosion={vi.fn()}
      onUndoDecline={vi.fn()}
      suggestions={[]}
    />,
  );

  expect(getByText(/仕事/)).toBeDefined();
  expect(getByText("本日の空き枠なし")).toBeDefined();
});
