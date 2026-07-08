// @vitest-environment happy-dom
import type { ComponentProps } from "react";
import { expect, test, vi } from "vite-plus/test";

import type { EditableWorkout } from "~/features/health/components/hiit-log-form";
import { HiitLogModal } from "~/features/health/components/hiit-log-modal";
import { renderWithMantine } from "~/test-utils";

vi.mock("~/features/health/components/hiit-log-form", () => ({
  HiitLogForm: ({ onDone, workout }: { onDone: () => void; workout?: EditableWorkout }) => (
    <div>
      <span>{workout ? `editing:${workout._id}` : "new workout"}</span>
      <button onClick={onDone} type="button">
        done
      </button>
    </div>
  ),
}));

function buildWorkout(overrides: Partial<EditableWorkout> = {}): EditableWorkout {
  return {
    _id: "workout_1",
    at: Date.UTC(2026, 6, 8, 11),
    durationMinutes: 30,
    kind: "hiit",
    perceivedIntensity: 7,
    ...overrides,
  } as EditableWorkout;
}

test("stays closed when target is null", () => {
  const { queryByText } = renderWithMantine(<HiitLogModal onClose={vi.fn()} target={null} />);

  expect(queryByText("new workout")).toBeNull();
});

test("opens a new workout form", () => {
  const { getByText } = renderWithMantine(<HiitLogModal onClose={vi.fn()} target="new" />);

  expect(getByText("HIIT記録")).toBeDefined();
  expect(getByText("new workout")).toBeDefined();
});

test("opens an edit form with the selected workout", async () => {
  const onClose = vi.fn();
  const { getByRole, getByText } = renderWithMantine(
    <HiitLogModal
      onClose={onClose as ComponentProps<typeof HiitLogModal>["onClose"]}
      target={buildWorkout()}
    />,
  );

  expect(getByText("記録を編集")).toBeDefined();
  expect(getByText("editing:workout_1")).toBeDefined();

  getByRole("button", { name: "done" }).click();
  expect(onClose).toHaveBeenCalled();
});
