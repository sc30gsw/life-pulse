// @vitest-environment happy-dom
import { renderHook } from "@testing-library/react";
import { expect, test, vi } from "vite-plus/test";

const testState = vi.hoisted(() => ({
  mutate: vi.fn(),
  nowMs: 5 * 60_000,
  partner: null as null | { etaHm?: string; state: "home"; updatedAt: number },
  show: vi.fn(),
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: testState.show },
}));

vi.mock("@tanstack/react-query", () => ({
  useSuspenseQuery: () => ({ data: testState.partner }),
}));

vi.mock("~/features/dashboard/hooks/use-board-clock", () => ({
  useBoardClock: () => ({ nowMs: testState.nowMs }),
}));

vi.mock("~/features/dashboard/hooks/use-set-presence", () => ({
  useSetPresence: () => ({ mutate: testState.mutate }),
}));

const { useDashboardPresence } = await import("~/features/dashboard/hooks/use-dashboard-presence");

test("returns 未更新 when partner presence has not been set", () => {
  testState.partner = null;

  const { result } = renderHook(() => useDashboardPresence());

  expect(result.current.partner).toBeNull();
  expect(result.current.partnerUpdatedRelativeLabel).toBe("未更新");
});

test("formats the partner updated time relative to the board clock", () => {
  testState.partner = { state: "home", updatedAt: 0 };

  const { result } = renderHook(() => useDashboardPresence());

  expect(result.current.partnerUpdatedRelativeLabel).toBe("5分前");
});

test("mutates presence and wires success and error notifications", () => {
  testState.partner = { state: "home", updatedAt: 0 };
  testState.mutate.mockClear();
  testState.show.mockClear();
  const { result } = renderHook(() => useDashboardPresence());

  result.current.onSetPresence("home");

  expect(testState.mutate).toHaveBeenCalledWith(
    { etaHm: undefined, state: "home" },
    expect.objectContaining({
      onError: expect.any(Function),
      onSuccess: expect.any(Function),
    }),
  );

  const callbacks = testState.mutate.mock.calls[0]?.[1] as {
    onError: () => void;
    onSuccess: () => void;
  };
  callbacks.onSuccess();
  callbacks.onError();

  expect(testState.show).toHaveBeenCalledWith({
    color: "blue",
    message: "パートナー: home",
    title: "更新しました",
  });
  expect(testState.show).toHaveBeenCalledWith({
    color: "red",
    message: "更新に失敗しました",
    title: "エラー",
  });
});
