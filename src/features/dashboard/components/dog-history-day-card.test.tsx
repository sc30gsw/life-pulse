// @vitest-environment happy-dom
import { expect, test } from "vite-plus/test";

import type { Id } from "~/../convex/_generated/dataModel";
import { DogHistoryDayCard } from "~/features/dashboard/components/dog-history-day-card";
import { renderWithMantine } from "~/test-utils";

test("renders dog history events for a single day", () => {
  const { getByText } = renderWithMantine(
    <DogHistoryDayCard
      day={{
        dateJst: "2026-07-05",
        events: [
          {
            at: 1000,
            byDisplayName: "本人",
            id: "event_1" as Id<"dogEvents">,
            taskName: "朝散歩",
          },
          {
            at: 2000,
            byDisplayName: "パートナー",
            id: "event_2" as Id<"dogEvents">,
            taskName: "朝ごはん",
          },
        ],
      }}
    />,
  );

  expect(getByText("2026-07-05")).toBeDefined();
  expect(getByText("2 件")).toBeDefined();
  expect(getByText("朝散歩")).toBeDefined();
  expect(getByText("朝ごはん")).toBeDefined();
  expect(getByText(/本人 · /)).toBeDefined();
  expect(getByText(/パートナー · /)).toBeDefined();
});
