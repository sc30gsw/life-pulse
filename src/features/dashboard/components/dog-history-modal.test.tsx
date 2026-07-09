// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import type { FunctionArgs, FunctionReturnType } from "convex/server";
import { expect, test, vi } from "vite-plus/test";

import { api } from "~/../convex/_generated/api";
import type { Id } from "~/../convex/_generated/dataModel";
import { DogHistoryModalContent } from "~/features/dashboard/components/dog-history-modal";
import { renderWithMantine } from "~/test-utils";

type HistoryQueryArgs = FunctionArgs<typeof api.queries.dog.history.history>;
type HistoryQueryResult = FunctionReturnType<typeof api.queries.dog.history.history>;

const historyState = vi.hoisted(() => ({
  days: [] as HistoryQueryResult["days"],
}));

vi.mock("@mantine/modals", () => ({ modals: { closeAll: vi.fn(), open: vi.fn() } }));

vi.mock("~/features/dashboard/api/dog-history-query", () => ({
  dogHistoryQuery: (
    fromDateJst: HistoryQueryArgs["fromDateJst"],
    toDateJst: HistoryQueryArgs["toDateJst"],
    includeOlderDays: HistoryQueryArgs["includeOlderDays"] = false,
  ) => ({
    fromDateJst,
    includeOlderDays,
    toDateJst,
  }),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useSuspenseQuery: (query: { includeOlderDays?: boolean }) => {
      const days = query.includeOlderDays ? historyState.days : historyState.days.slice(0, 2);

      return {
        data: {
          days,
          summary: {
            eventCount: historyState.days.reduce((total, day) => total + day.events.length, 0),
            hasOlderDays: historyState.days.length > 2,
            olderDayCount: Math.max(historyState.days.length - 2, 0),
            totalDayCount: historyState.days.length,
          },
        },
      };
    },
  };
});

test("DogHistoryModalContent shows events grouped by date", () => {
  historyState.days = [
    {
      dateJst: "2026-07-05",
      events: [
        { at: 1000, byDisplayName: "本人", id: "event_1" as Id<"dogEvents">, taskName: "朝散歩" },
      ],
    },
  ];

  const { getByText } = renderWithMantine(<DogHistoryModalContent />);

  expect(getByText("2026-07-05")).toBeDefined();
  expect(getByText("朝散歩")).toBeDefined();
});

test("DogHistoryModalContent initially limits older days and can expand them", async () => {
  historyState.days = [
    {
      dateJst: "2026-07-07",
      events: [
        { at: 1000, byDisplayName: "本人", id: "event_1" as Id<"dogEvents">, taskName: "朝散歩" },
      ],
    },
    {
      dateJst: "2026-07-06",
      events: [
        { at: 2000, byDisplayName: "本人", id: "event_2" as Id<"dogEvents">, taskName: "朝ごはん" },
      ],
    },
    {
      dateJst: "2026-07-05",
      events: [
        { at: 3000, byDisplayName: "本人", id: "event_3" as Id<"dogEvents">, taskName: "夜ごはん" },
      ],
    },
  ];
  const user = userEvent.setup();
  const modal = renderWithMantine(<DogHistoryModalContent />);

  expect(modal.getByText("2026-07-07")).toBeDefined();
  expect(modal.getByText("2026-07-06")).toBeDefined();
  expect(modal.queryByText("2026-07-05")).toBeNull();

  await user.click(modal.getByRole("button", { name: "過去 1 日を表示" }));

  expect(modal.getByText("2026-07-05")).toBeDefined();
});

test("DogHistoryModalContent shows 履歴なし when there are no past events", () => {
  historyState.days = [];
  const { getByText } = renderWithMantine(<DogHistoryModalContent />);

  expect(getByText("履歴なし")).toBeDefined();
});
