// @vitest-environment happy-dom
import { renderHook } from "@testing-library/react";
import { expect, test, vi } from "vite-plus/test";

const testState = vi.hoisted(() => ({
  logMutate: vi.fn(),
  openConfirmModal: vi.fn(),
  show: vi.fn(),
  undoMutate: vi.fn(),
}));

vi.mock("@mantine/modals", () => ({
  modals: { openConfirmModal: testState.openConfirmModal },
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: testState.show },
}));

vi.mock("@tanstack/react-query", () => ({
  useSuspenseQuery: () => ({
    data: {
      dogImageUrl: "https://example.com/dog.jpg",
      dogName: "ハマロ",
      tasks: [
        {
          at: undefined,
          byRole: undefined,
          done: false,
          eventId: undefined,
          name: "朝散歩",
          taskId: "task_walk_am",
        },
        {
          at: 1000,
          byRole: "self",
          done: true,
          eventId: "event_1",
          name: "朝ごはん",
          taskId: "task_meal_am",
        },
      ],
    },
  }),
}));

vi.mock("~/features/dashboard/hooks/use-board-clock", () => ({
  useBoardClock: () => ({ dateJst: "2026-07-07" }),
}));

vi.mock("~/features/dashboard/hooks/use-log-dog-event", () => ({
  useLogDogEvent: () => ({ mutate: testState.logMutate }),
}));

vi.mock("~/features/dashboard/hooks/use-undo-dog-event", () => ({
  useUndoDogEvent: () => ({ mutate: testState.undoMutate }),
}));

const { useDashboardDog } = await import("~/features/dashboard/hooks/use-dashboard-dog");

test("logs a pending dog event and wires success/error notifications", () => {
  testState.logMutate.mockClear();
  testState.show.mockClear();
  const { result } = renderHook(() => useDashboardDog());

  expect(result.current.dogImageUrl).toBe("https://example.com/dog.jpg");
  result.current.onToggleDogCare("task_walk_am" as never);

  expect(testState.logMutate).toHaveBeenCalledWith(
    { dateJst: "2026-07-07", taskId: "task_walk_am" },
    expect.objectContaining({
      onError: expect.any(Function),
      onSuccess: expect.any(Function),
    }),
  );

  const callbacks = testState.logMutate.mock.calls[0]?.[1] as {
    onError: () => void;
    onSuccess: () => void;
  };
  callbacks.onSuccess();
  callbacks.onError();

  expect(testState.show).toHaveBeenCalledWith({
    color: "green",
    message: "ハマロの朝散歩を記録しました",
    title: "記録しました",
  });
  expect(testState.show).toHaveBeenCalledWith({
    color: "red",
    message: "記録に失敗しました",
    title: "エラー",
  });
});

test("ignores an unknown dog event kind", () => {
  testState.logMutate.mockClear();
  testState.openConfirmModal.mockClear();
  const { result } = renderHook(() => useDashboardDog());

  result.current.onToggleDogCare("unknown" as never);

  expect(testState.logMutate).not.toHaveBeenCalled();
  expect(testState.openConfirmModal).not.toHaveBeenCalled();
});

test("opens the undo confirmation for a completed dog event", () => {
  testState.openConfirmModal.mockClear();
  testState.undoMutate.mockClear();
  testState.show.mockClear();
  const { result } = renderHook(() => useDashboardDog());

  result.current.onToggleDogCare("task_meal_am" as never);

  expect(testState.openConfirmModal).toHaveBeenCalledWith(
    expect.objectContaining({
      cancelProps: { className: "border-bd bg-inset text-tx hover:bg-panel-2" },
      labels: { cancel: "キャンセル", confirm: "取り消す" },
      title: "記録を取り消しますか?",
    }),
  );

  const modal = testState.openConfirmModal.mock.calls[0]?.[0] as { onConfirm: () => void };
  modal.onConfirm();

  expect(testState.undoMutate).toHaveBeenCalledWith(
    { dateJst: "2026-07-07", eventId: "event_1" },
    expect.objectContaining({
      onError: expect.any(Function),
      onSuccess: expect.any(Function),
    }),
  );

  const callbacks = testState.undoMutate.mock.calls[0]?.[1] as {
    onError: () => void;
    onSuccess: () => void;
  };
  callbacks.onSuccess();
  callbacks.onError();

  expect(testState.show).toHaveBeenCalledWith({
    color: "red",
    message: "ハマロの朝ごはんを取り消しました",
    title: "取り消しました",
  });
  expect(testState.show).toHaveBeenCalledWith({
    color: "red",
    message: "取消に失敗しました",
    title: "エラー",
  });
});
