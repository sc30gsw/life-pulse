// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import type { Doc } from "~/../convex/_generated/dataModel";
import {
  UpcomingBlockList,
  UpcomingBlockListFallback,
} from "~/features/study/components/upcoming-block-list";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  blocks: [] as Partial<Doc<"studyBlocks">>[],
  onCancel: vi.fn(),
}));

vi.mock("~/features/study/hooks/use-upcoming-blocks", () => ({
  useUpcomingBlocks: () => hookState,
}));

vi.mock("~/features/study/components/edit-block-modal", () => ({
  EditBlockModal: ({ block }: { block: Doc<"studyBlocks"> | null }) =>
    block === null ? null : <div>編集中: {block.startHm}</div>,
}));

function buildBlock(overrides: Partial<Doc<"studyBlocks">> = {}): Partial<Doc<"studyBlocks">> {
  return {
    _id: "block_1" as Doc<"studyBlocks">["_id"],
    category: "toeic",
    dateJst: "2026-01-01",
    endHm: "07:00",
    plannedMinutes: 60,
    source: "manual",
    startHm: "06:00",
    status: "planned",
    ...overrides,
  };
}

test("shows an empty message when there are no upcoming blocks", () => {
  hookState.blocks = [];

  const { getByText } = renderWithMantine(<UpcomingBlockList />);

  expect(getByText("予定枠はまだありません")).toBeDefined();
});

test("renders upcoming block details with holiday label", () => {
  hookState.blocks = [buildBlock()];

  const { getByText } = renderWithMantine(<UpcomingBlockList />);

  expect(getByText("2026-01-01 06:00〜07:00")).toBeDefined();
  expect(getByText("元日")).toBeDefined();
  expect(getByText("TOEIC")).toBeDefined();
  expect(getByText("60分")).toBeDefined();
});

test("opens edit modal for the selected block", async () => {
  hookState.blocks = [buildBlock()];
  const user = userEvent.setup();

  const { getByRole, getByText } = renderWithMantine(<UpcomingBlockList />);

  await user.click(getByRole("button", { name: "編集" }));

  expect(getByText("編集中: 06:00")).toBeDefined();
});

test("reports a cancellation request for the selected block", async () => {
  hookState.blocks = [buildBlock()];
  hookState.onCancel.mockClear();
  const user = userEvent.setup();

  const { getByRole } = renderWithMantine(<UpcomingBlockList />);

  await user.click(getByRole("button", { name: "キャンセル" }));

  expect(hookState.onCancel).toHaveBeenCalledWith(expect.objectContaining({ _id: "block_1" }));
});

test("renders a structure-aware shimmer fallback", () => {
  const { getAllByText } = renderWithMantine(<UpcomingBlockListFallback />);

  expect(getAllByText("2026-07-08 06:00〜07:00").length).toBeGreaterThan(0);
});
