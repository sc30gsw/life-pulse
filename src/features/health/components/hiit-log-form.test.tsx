// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import type { EditableWorkout } from "~/features/health/components/hiit-log-form";
import { HiitLogForm } from "~/features/health/components/hiit-log-form";
import { renderWithMantine } from "~/test-utils";

const mutationState = vi.hoisted(() => ({
  logMutate: vi.fn(),
  notificationShow: vi.fn(),
  updateMutate: vi.fn(),
}));

vi.mock("~/features/health/hooks/use-log-workout", () => ({
  useLogWorkout: () => ({ mutate: mutationState.logMutate }),
}));

vi.mock("~/features/health/hooks/use-update-workout", () => ({
  useUpdateWorkout: () => ({ mutate: mutationState.updateMutate }),
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: mutationState.notificationShow },
}));

vi.mock("@mantine/dates", () => ({
  DateTimePicker: ({
    error,
    label,
    onChange,
    value,
  }: {
    error?: string;
    label: string;
    onChange: (value: string | null) => void;
    value?: string;
  }) => (
    <label>
      {label}
      <input
        aria-label={label}
        onChange={(event) => onChange(event.currentTarget.value)}
        value={value ?? ""}
      />
      {error ? <span>{error}</span> : null}
    </label>
  ),
}));

function buildWorkout(overrides: Partial<EditableWorkout> = {}): EditableWorkout {
  return {
    _id: "workout_1",
    at: Date.UTC(2026, 6, 8, 11),
    durationMinutes: 25,
    kind: "walk",
    perceivedIntensity: 4,
    ...overrides,
  } as EditableWorkout;
}

test("logs a new workout and calls onDone after a successful mutation", async () => {
  mutationState.logMutate.mockImplementation((_payload, options) => options.onSuccess());
  mutationState.updateMutate.mockClear();
  mutationState.notificationShow.mockClear();
  const onDone = vi.fn();
  const user = userEvent.setup();

  const { getByLabelText, getByRole } = renderWithMantine(<HiitLogForm onDone={onDone} />);

  await user.clear(getByLabelText("時間(分)"));
  await user.type(getByLabelText("時間(分)"), "18");
  await user.type(getByLabelText("主観強度(1〜10、任意)"), "8");
  await user.click(getByRole("button", { name: "記録する" }));

  expect(mutationState.logMutate).toHaveBeenCalled();
  const [payload] = mutationState.logMutate.mock.calls[0] as [Record<string, unknown>];
  expect(payload.durationMinutes).toBe(18);
  expect(payload.perceivedIntensity).toBe(8);
  expect(mutationState.updateMutate).not.toHaveBeenCalled();
  expect(mutationState.notificationShow).toHaveBeenCalledWith(
    expect.objectContaining({ message: "記録しました" }),
  );
  expect(onDone).toHaveBeenCalled();
});

test("updates an existing workout with its id", async () => {
  mutationState.logMutate.mockClear();
  mutationState.updateMutate.mockImplementation((_payload, options) => options.onSuccess());
  const onDone = vi.fn();
  const user = userEvent.setup();

  const { getByRole } = renderWithMantine(<HiitLogForm onDone={onDone} workout={buildWorkout()} />);

  await user.click(getByRole("button", { name: "更新する" }));

  expect(mutationState.updateMutate).toHaveBeenCalled();
  const [payload] = mutationState.updateMutate.mock.calls[0] as [Record<string, unknown>];
  expect(payload.workoutId).toBe("workout_1");
  expect(payload.kind).toBe("walk");
  expect(mutationState.logMutate).not.toHaveBeenCalled();
  expect(onDone).toHaveBeenCalled();
});

test("shows an error notification when logging fails", async () => {
  mutationState.logMutate.mockImplementation((_payload, options) => options.onError());
  mutationState.notificationShow.mockClear();
  const user = userEvent.setup();

  const { getByRole } = renderWithMantine(<HiitLogForm onDone={vi.fn()} />);

  await user.click(getByRole("button", { name: "記録する" }));

  expect(mutationState.notificationShow).toHaveBeenCalledWith(
    expect.objectContaining({ color: "red", message: "記録に失敗しました" }),
  );
});
