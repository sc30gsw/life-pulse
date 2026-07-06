// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { DogCardView } from "~/features/dashboard/components/dog-card";
import { renderWithMantine } from "~/test-utils";

const PENDING_ITEM = { at: null, by: null, done: false, kind: "walk_am" as const };
const DONE_SELF_ITEM = { at: 1000, by: "self" as const, done: true, kind: "meal_am" as const };
const DONE_PARTNER_ITEM = { at: 2000, by: "partner" as const, done: true, kind: "meds" as const };

test("renders the dog name and its initial letter", () => {
  const { getByText } = renderWithMantine(
    <DogCardView dogCare={[]} dogFlash={false} dogName="ハマロ" onToggleDogCare={vi.fn()} />,
  );

  expect(getByText("ハマロ")).toBeDefined();
  expect(getByText("ハ")).toBeDefined();
});

test("shows the pending-count badge when some items are not done", () => {
  const { getByText } = renderWithMantine(
    <DogCardView
      dogCare={[PENDING_ITEM, DONE_SELF_ITEM]}
      dogFlash={false}
      dogName="ハマロ"
      onToggleDogCare={vi.fn()}
    />,
  );

  expect(getByText("未実施 1 件")).toBeDefined();
});

test("shows the all-done badge when every item is done", () => {
  const { getByText } = renderWithMantine(
    <DogCardView
      dogCare={[DONE_SELF_ITEM, DONE_PARTNER_ITEM]}
      dogFlash={false}
      dogName="ハマロ"
      onToggleDogCare={vi.fn()}
    />,
  );

  expect(getByText("すべて完了")).toBeDefined();
});

test("shows self/partner actor label for done items", () => {
  const { getByText } = renderWithMantine(
    <DogCardView
      dogCare={[DONE_SELF_ITEM, DONE_PARTNER_ITEM]}
      dogFlash={false}
      dogName="ハマロ"
      onToggleDogCare={vi.fn()}
    />,
  );

  expect(getByText("本人")).toBeDefined();
  expect(getByText("妻")).toBeDefined();
});

test("shows 未 for a pending item and calls onToggleDogCare with its kind on click", async () => {
  const onToggleDogCare = vi.fn();
  const user = userEvent.setup();
  const { getByText, getByRole } = renderWithMantine(
    <DogCardView
      dogCare={[PENDING_ITEM]}
      dogFlash={false}
      dogName="ハマロ"
      onToggleDogCare={onToggleDogCare}
    />,
  );

  expect(getByText("未")).toBeDefined();

  await user.click(getByRole("button", { name: /朝散歩/ }));

  expect(onToggleDogCare).toHaveBeenCalledWith("walk_am");
});
