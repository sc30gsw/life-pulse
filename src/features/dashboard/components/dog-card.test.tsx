// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { DogCard, DogCardFallback } from "~/features/dashboard/components/dog-card";
import { renderWithMantine } from "~/test-utils";

const onToggleDogCare = vi.fn();
const hookState = vi.hoisted(() => ({
  dogCare: [
    {
      at: null,
      by: null,
      done: false,
      eventId: null,
      name: "朝散歩",
      taskId: "task_walk_am",
    },
    {
      at: 1000,
      by: "self",
      done: true,
      eventId: "event_1",
      name: "朝ごはん",
      taskId: "task_meal_am",
    },
    {
      at: 2000,
      by: "partner",
      done: true,
      eventId: "event_2",
      name: "薬",
      taskId: "task_meds",
    },
  ],
  openModal: vi.fn(),
}));

vi.mock("~/features/dashboard/hooks/use-dashboard-dog", () => ({
  useDashboardDog: () => ({
    dogCare: hookState.dogCare,
    dogFlash: false,
    dogImageUrl: "https://example.com/dog.jpg",
    dogName: "ハマロ",
    hasDog: true,
    onToggleDogCare,
  }),
}));

vi.mock("@mantine/modals", () => ({ modals: { open: hookState.openModal } }));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

test("renders the dog name, photo avatar, pending count, and actor labels", () => {
  const { getByAltText, getByText } = renderWithMantine(<DogCard />);

  expect(getByText("ハマロ")).toBeDefined();
  expect(getByAltText("ハマロ").getAttribute("src")).toBe("https://example.com/dog.jpg");
  expect(getByText("未実施 1 件")).toBeDefined();
  expect(getByText("本人")).toBeDefined();
  expect(getByText("パートナー")).toBeDefined();
});

test("calls onToggleDogCare with the clicked care item task id", async () => {
  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(<DogCard />);

  await user.click(getByRole("button", { name: /朝散歩/ }));

  expect(onToggleDogCare).toHaveBeenCalledWith("task_walk_am");
});

test("shows the all-done badge when every care item is done", () => {
  hookState.dogCare = [
    {
      at: 1000,
      by: "self",
      done: true,
      eventId: "event_1",
      name: "朝ごはん",
      taskId: "task_meal_am",
    },
    {
      at: 2000,
      by: "partner",
      done: true,
      eventId: "event_2",
      name: "薬",
      taskId: "task_meds",
    },
  ];

  const { getByText } = renderWithMantine(<DogCard />);

  expect(getByText("すべて完了")).toBeDefined();
});

test("renders a structure-aware shimmer fallback", () => {
  const { getAllByText, getByText } = renderWithMantine(<DogCardFallback />);

  expect(getAllByText("犬").length).toBeGreaterThan(0);
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
