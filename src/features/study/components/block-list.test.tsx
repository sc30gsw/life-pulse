// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import type { Doc, Id } from "~/../convex/_generated/dataModel";
import { BlockList, BlockListFallback } from "~/features/study/components/block-list";
import { renderWithMantine } from "~/test-utils";

const categoryState = vi.hoisted(() => ({
  toeicCategoryId: "category_toeic" as Id<"studyCategories">,
}));

const hookState = vi.hoisted(() => ({
  blocks: [] as Partial<Doc<"studyBlocks">>[],
  onDecline: vi.fn(),
  onErode: vi.fn(),
  onReschedule: vi.fn(),
  onStartFromBlock: vi.fn(),
  onUndoDecline: vi.fn(),
  suggestions: [] as string[],
}));

vi.mock("~/features/study/hooks/use-study-blocks", () => ({
  useStudyBlocks: () => hookState,
}));

vi.mock("~/features/study-categories/hooks/use-study-categories-query", () => ({
  useStudyCategoriesQuery: () => ({
    categoryName: (categoryId: Id<"studyCategories"> | undefined) =>
      categoryId === categoryState.toeicCategoryId ? "TOEIC" : "カテゴリ未設定",
  }),
}));

function buildBlock(overrides: Partial<Doc<"studyBlocks">>): Partial<Doc<"studyBlocks">> {
  return {
    _id: "block_1" as Doc<"studyBlocks">["_id"],
    categoryId: categoryState.toeicCategoryId,
    dateJst: "2026-07-07",
    endHm: "07:00",
    plannedMinutes: 60,
    source: "manual",
    startHm: "06:00",
    status: "planned",
    ...overrides,
  };
}

test("shows an empty message when no blocks are declared", () => {
  hookState.blocks = [];

  const { getByText } = renderWithMantine(<BlockList />);

  expect(getByText("今日の枠はまだ宣言されていません")).toBeDefined();
});

test("renders a planned block with start and erode actions", async () => {
  hookState.blocks = [buildBlock({})];
  hookState.onStartFromBlock.mockClear();

  const user = userEvent.setup();
  const { getByRole, getByText } = renderWithMantine(<BlockList />);

  expect(getByText("06:00〜07:00")).toBeDefined();
  expect(getByText("TOEIC")).toBeDefined();
  expect(getByText("予定")).toBeDefined();

  await user.click(getByRole("button", { name: "この枠で開始" }));
  expect(hookState.onStartFromBlock).toHaveBeenCalled();
});

test("erode flow reveals reason chips and reports the picked reason", async () => {
  hookState.blocks = [buildBlock({})];
  hookState.onErode.mockClear();

  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(<BlockList />);

  await user.click(getByRole("button", { name: "侵食" }));
  await user.click(getByRole("button", { name: "疲労" }));

  expect(hookState.onErode).toHaveBeenCalledWith("block_1", "fatigue");
});

test("an eroded block offers reschedule slot chips", async () => {
  hookState.blocks = [buildBlock({ erosionReason: "work", status: "eroded" })];
  hookState.suggestions = ["13:30", "14:00"];
  hookState.onReschedule.mockClear();

  const user = userEvent.setup();
  const { getByRole, getByText } = renderWithMantine(<BlockList />);

  expect(getByText(/仕事/)).toBeDefined();
  expect(getByText(/リスケ候補/)).toBeDefined();

  await user.click(getByRole("button", { name: "13:30〜" }));
  expect(hookState.onReschedule).toHaveBeenCalledWith(
    expect.objectContaining({ _id: "block_1" }),
    "13:30",
  );
});

test("an eroded block offers a decline-reschedule button", async () => {
  hookState.blocks = [buildBlock({ erosionReason: "work", status: "eroded" })];
  hookState.suggestions = ["13:30"];
  hookState.onDecline.mockClear();

  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(<BlockList />);

  await user.click(getByRole("button", { name: "リスケしない" }));
  expect(hookState.onDecline).toHaveBeenCalledWith(expect.objectContaining({ _id: "block_1" }));
});

test("a declined block offers an undo button", async () => {
  hookState.blocks = [buildBlock({ erosionReason: "work", status: "declined" })];
  hookState.onUndoDecline.mockClear();

  const user = userEvent.setup();
  const { getByRole, getByText } = renderWithMantine(<BlockList />);

  expect(getByText("見送り")).toBeDefined();

  await user.click(getByRole("button", { name: "元に戻す" }));
  expect(hookState.onUndoDecline).toHaveBeenCalledWith("block_1");
});

test("renders a structure-aware shimmer fallback", () => {
  const { getAllByText } = renderWithMantine(<BlockListFallback />);

  expect(getAllByText("06:00〜07:00").length).toBeGreaterThan(0);
});
