// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { DogCareRow } from "~/features/dashboard/components/dog-care-row";
import { renderWithMantine } from "~/test-utils";

test("renders an undone dog care item and toggles it by task id", async () => {
  const onToggle = vi.fn();
  const user = userEvent.setup();
  const { getByRole, getByText } = renderWithMantine(
    <DogCareRow
      item={{
        at: null,
        by: null,
        done: false,
        eventId: null,
        name: "朝散歩",
        taskId: "task_walk_am",
      }}
      onToggle={onToggle}
    />,
  );

  expect(getByText("朝散歩")).toBeDefined();
  expect(getByText("未")).toBeDefined();

  await user.click(getByRole("button", { name: /朝散歩/ }));

  expect(onToggle).toHaveBeenCalledWith("task_walk_am");
});

test("renders who completed a done dog care item", () => {
  const { getByText } = renderWithMantine(
    <DogCareRow
      item={{
        at: 1000,
        by: "partner",
        done: true,
        eventId: "event_1",
        name: "朝ごはん",
        taskId: "task_meal_am",
      }}
      onToggle={vi.fn()}
    />,
  );

  expect(getByText("朝ごはん")).toBeDefined();
  expect(getByText("パートナー")).toBeDefined();
});
