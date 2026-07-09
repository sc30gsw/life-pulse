// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import type { Doc, Id } from "~/../convex/_generated/dataModel";
import { WorkoutList, WorkoutListFallback } from "~/features/health/components/workout-list";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  deleteMutate: vi.fn(),
  openConfirmModal: vi.fn(),
  workoutList: {
    hasMore: false,
    hiddenWorkouts: [] as Doc<"workouts">[],
    visibleWorkouts: [] as Doc<"workouts">[],
  },
}));

vi.mock("~/features/health/hooks/use-workout-list", () => ({
  useWorkoutList: () => ({ data: hookState.workoutList }),
}));

vi.mock("~/features/health/hooks/use-delete-workout", () => ({
  useDeleteWorkout: () => ({ mutate: hookState.deleteMutate }),
}));

vi.mock("@mantine/modals", () => ({
  modals: { openConfirmModal: hookState.openConfirmModal },
}));

function buildWorkout(overrides: Partial<Doc<"workouts">> = {}): Doc<"workouts"> {
  return {
    _creationTime: 0,
    _id: "workout_1",
    at: Date.UTC(2026, 6, 8, 11, 0, 0),
    dateJst: "2026-07-08",
    durationMinutes: 30,
    kind: "hiit",
    perceivedIntensity: 7,
    ...overrides,
  } as unknown as Doc<"workouts">;
}

test("shows an empty state when there are no workouts", () => {
  hookState.workoutList = { hasMore: false, hiddenWorkouts: [], visibleWorkouts: [] };

  const { getByText } = renderWithMantine(<WorkoutList onEdit={vi.fn()} />);

  expect(getByText("記録はまだありません")).toBeDefined();
});

test("opens a confirm dialog before deleting, and confirming calls the delete mutation", async () => {
  hookState.workoutList = {
    hasMore: false,
    hiddenWorkouts: [],
    visibleWorkouts: [buildWorkout()],
  };
  hookState.openConfirmModal.mockClear();
  hookState.deleteMutate.mockClear();
  const user = userEvent.setup();

  const { getByRole } = renderWithMantine(<WorkoutList onEdit={vi.fn()} />);

  await user.click(getByRole("button", { name: "削除" }));

  expect(hookState.deleteMutate).not.toHaveBeenCalled();
  expect(hookState.openConfirmModal).toHaveBeenCalledWith(
    expect.objectContaining({ title: "記録を削除しますか?" }),
  );

  const modal = hookState.openConfirmModal.mock.calls[0]?.[0] as { onConfirm: () => void };
  modal.onConfirm();

  expect(hookState.deleteMutate).toHaveBeenCalledWith({ workoutId: "workout_1" });
});

test("calls onEdit with the workout when 編集 is clicked", async () => {
  const workout = buildWorkout();
  hookState.workoutList = {
    hasMore: false,
    hiddenWorkouts: [],
    visibleWorkouts: [workout],
  };
  const onEdit = vi.fn();
  const user = userEvent.setup();

  const { getByRole } = renderWithMantine(<WorkoutList onEdit={onEdit} />);

  await user.click(getByRole("button", { name: "編集" }));

  expect(onEdit).toHaveBeenCalledWith(workout);
});

test("renders workout details without intensity when it is not set", () => {
  hookState.workoutList = {
    hasMore: false,
    hiddenWorkouts: [],
    visibleWorkouts: [buildWorkout({ perceivedIntensity: undefined })],
  };

  const { getByText, queryByText } = renderWithMantine(<WorkoutList onEdit={vi.fn()} />);

  expect(getByText("HIIT")).toBeDefined();
  expect(getByText("30分")).toBeDefined();
  expect(queryByText(/強度/)).toBeNull();
});

test("shows a collapse toggle when there are hidden workouts and reveals them on click", async () => {
  hookState.workoutList = {
    hasMore: false,
    hiddenWorkouts: [
      buildWorkout({ _id: "workout_2" as Id<"workouts">, at: Date.UTC(2026, 6, 8, 10, 0, 0) }),
    ],
    visibleWorkouts: [buildWorkout()],
  };
  const user = userEvent.setup();

  const { getByRole, getByText } = renderWithMantine(<WorkoutList onEdit={vi.fn()} />);

  expect(getByRole("button", { name: "さらに表示" })).toBeDefined();
  expect(getByText("7/8 20:00")).toBeDefined();
  expect(getByText("7/8 19:00")).toBeDefined();

  await user.click(getByRole("button", { name: "さらに表示" }));

  expect(getByRole("button", { name: "閉じる" })).toBeDefined();
});

test("renders fallback skeleton rows", () => {
  const { getByText } = renderWithMantine(<WorkoutListFallback />);

  expect(getByText("7/1 20:00")).toBeDefined();
  expect(getByText("7/2 20:00")).toBeDefined();
});
