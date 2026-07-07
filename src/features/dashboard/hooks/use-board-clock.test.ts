// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";

const { todayJstMock, toDateJstMock } = vi.hoisted(() => ({
  toDateJstMock: vi.fn(() => "2026-07-07"),
  todayJstMock: vi.fn(() => "2026-07-07"),
}));

vi.mock("~/utils/date-jst", () => ({ toDateJst: toDateJstMock, todayJst: todayJstMock }));

const { useBoardClock } = await import("~/features/dashboard/hooks/use-board-clock");

const FIXED_NOW = 600_000;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
  vi.clearAllMocks();
  todayJstMock.mockReturnValue("2026-07-07");
  toDateJstMock.mockReturnValue("2026-07-07");
});

afterEach(() => {
  vi.useRealTimers();
});

test("returns the shared board clock and date key", () => {
  const { result } = renderHook(() => useBoardClock());

  expect(result.current.dateJst).toBe("2026-07-07");
  expect(result.current.nowMs).toBe(FIXED_NOW);
  expect(result.current.clockTime).toBeDefined();
  expect(result.current.clockDateLabel).toBeDefined();
});

test("updates nowMs and dateJst on the one-second clock tick", () => {
  const { result } = renderHook(() => useBoardClock());
  toDateJstMock.mockReturnValue("2026-07-08");
  vi.setSystemTime(FIXED_NOW + 1_000);

  act(() => {
    vi.advanceTimersByTime(1_000);
  });

  expect(result.current.nowMs).toBeGreaterThan(FIXED_NOW);
  expect(result.current.dateJst).toBe("2026-07-08");
});

test("clears the clock interval on unmount", () => {
  const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");
  const { unmount } = renderHook(() => useBoardClock());

  unmount();

  expect(clearIntervalSpy).toHaveBeenCalled();
});
