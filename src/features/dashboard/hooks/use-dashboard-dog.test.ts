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
      dogName: "ハマロ",
      events: [{ at: 1000, by: "self", id: "event_1", kind: "meal_am" }],
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

  result.current.onToggleDogCare("walk_am");

  expect(testState.logMutate).toHaveBeenCalledWith(
    { dateJst: "2026-07-07", kind: "walk_am" },
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

  result.current.onToggleDogCare("meal_am");

  expect(testState.openConfirmModal).toHaveBeenCalledWith(
    expect.objectContaining({
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
    color: "gray",
    message: "ハマロの朝ごはんを取り消しました",
    title: "取り消しました",
  });
  expect(testState.show).toHaveBeenCalledWith({
    color: "red",
    message: "取消に失敗しました",
    title: "エラー",
  });
});
