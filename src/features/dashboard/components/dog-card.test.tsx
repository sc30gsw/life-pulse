// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import type { Doc, Id } from "~/../convex/_generated/dataModel";
import { DogCard, DogCardFallback } from "~/features/dashboard/components/dog-card";
import { renderWithMantine } from "~/test-utils";

const onToggleDogCare = vi.fn();
const hookState = vi.hoisted(() => ({
  dogCare: [
    { at: null, by: null, done: false, kind: "walk_am" },
    { at: 1000, by: "self", done: true, kind: "meal_am" },
    { at: 2000, by: "partner", done: true, kind: "meds" },
  ],
  historyDays: [] as {
    dateJst: Doc<"dogEvents">["dateJst"];
    events: {
      at: Doc<"dogEvents">["at"];
      byDisplayName: Doc<"appUsers">["displayName"];
      id: Doc<"dogEvents">["_id"];
      kind: Doc<"dogEvents">["kind"];
    }[];
  }[],
  openModal: vi.fn(),
}));

vi.mock("~/features/dashboard/hooks/use-dashboard-dog", () => ({
  useDashboardDog: () => ({
    dogCare: hookState.dogCare,
    dogFlash: false,
    dogName: "ハマロ",
    onToggleDogCare,
  }),
}));

vi.mock("@mantine/modals", () => ({ modals: { open: hookState.openModal } }));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useSuspenseQuery: () => ({ data: { days: hookState.historyDays } }),
  };
});

test("renders the dog name, photo avatar, pending count, and actor labels", () => {
  const { getByAltText, getByText } = renderWithMantine(<DogCard />);

  expect(getByText("ハマロ")).toBeDefined();
  expect(getByAltText("ハマロ").getAttribute("src")).toBe("/assets/hamaro.JPEG");
  expect(getByText("未実施 1 件")).toBeDefined();
  expect(getByText("本人")).toBeDefined();
  expect(getByText("パートナー")).toBeDefined();
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

test("clicking 履歴 opens the history modal", async () => {
  hookState.openModal.mockClear();
  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(<DogCard />);

  await user.click(getByRole("button", { name: "履歴" }));

  expect(hookState.openModal).toHaveBeenCalledWith(
    expect.objectContaining({ children: expect.anything(), title: "犬のお世話履歴" }),
  );
});

test("history modal content shows events grouped by date", async () => {
  hookState.openModal.mockClear();
  hookState.historyDays = [
    {
      dateJst: "2026-07-05",
      events: [
        { at: 1000, byDisplayName: "本人", id: "event_1" as Id<"dogEvents">, kind: "walk_am" },
      ],
    },
  ];
  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(<DogCard />);

  await user.click(getByRole("button", { name: "履歴" }));

  const modalChildren = hookState.openModal.mock.calls[0]?.[0].children;
  const { getByText } = renderWithMantine(modalChildren);

  expect(getByText("2026-07-05")).toBeDefined();
  expect(getByText("朝散歩")).toBeDefined();
});

test("history modal content shows 履歴なし when there are no past events", async () => {
  hookState.openModal.mockClear();
  hookState.historyDays = [];
  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(<DogCard />);

  await user.click(getByRole("button", { name: "履歴" }));

  const modalChildren = hookState.openModal.mock.calls[0]?.[0].children;
  const { getByText } = renderWithMantine(modalChildren);

  expect(getByText("履歴なし")).toBeDefined();
});
