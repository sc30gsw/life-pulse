// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { DogCard, DogCardFallback } from "~/features/dashboard/components/dog-card";
import { renderWithMantine } from "~/test-utils";

const onToggleDogCare = vi.fn();
const hookState = vi.hoisted(() => ({
  dogCare: [
    { at: null, by: null, done: false, kind: "walk_am" },
    { at: 1000, by: "self", done: true, kind: "meal_am" },
    { at: 2000, by: "partner", done: true, kind: "meds" },
  ],
}));

vi.mock("~/features/dashboard/hooks/use-dashboard-dog", () => ({
  useDashboardDog: () => ({
    dogCare: hookState.dogCare,
    dogFlash: false,
    dogName: "ハマロ",
    onToggleDogCare,
  }),
}));

test("renders the dog name, pending count, and actor labels", () => {
  const { getByText } = renderWithMantine(<DogCard />);

  expect(getByText("ハマロ")).toBeDefined();
  expect(getByText("ハ")).toBeDefined();
  expect(getByText("未実施 1 件")).toBeDefined();
  expect(getByText("本人")).toBeDefined();
  expect(getByText("妻")).toBeDefined();
});

test("calls onToggleDogCare with the clicked care item kind", async () => {
  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(<DogCard />);

  await user.click(getByRole("button", { name: /朝散歩/ }));

  expect(onToggleDogCare).toHaveBeenCalledWith("walk_am");
});

test("shows the all-done badge when every care item is done", () => {
  hookState.dogCare = [
    { at: 1000, by: "self", done: true, kind: "meal_am" },
    { at: 2000, by: "partner", done: true, kind: "meds" },
  ];

  const { getByText } = renderWithMantine(<DogCard />);

  expect(getByText("すべて完了")).toBeDefined();
});

test("renders a structure-aware shimmer fallback", () => {
  const { getByText } = renderWithMantine(<DogCardFallback />);

  expect(getByText("ハマロ")).toBeDefined();
  expect(getByText("未実施 3 件")).toBeDefined();
});
