// @vitest-environment happy-dom
import { renderHook } from "@testing-library/react";
import { ConvexError } from "convex/values";
import { expect, test, vi } from "vite-plus/test";

const testState = vi.hoisted(() => ({
  completeMutate: vi.fn(),
  dateJst: "2026-07-07",
  pauseMutate: vi.fn(),
  resumeMutate: vi.fn(),
  show: vi.fn(),
  startMutate: vi.fn(),
  study: {
    blocks: [] as { category: string; plannedMinutes: number; startHm: string; status: string }[],
    session: null as null | {
      category: string;
      interruptionCount: number;
      lastResumedAt?: number;
      plannedMinutes?: number;
      startedAt: number;
      status: "abandoned" | "active" | "completed" | "paused";
    },
    todayActualMinutes: 0,
  },
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: testState.show },
}));

vi.mock("@tanstack/react-query", () => ({
  useSuspenseQuery: () => ({ data: testState.study }),
}));

vi.mock("~/features/dashboard/hooks/use-board-clock", () => ({
  useBoardClock: () => ({ dateJst: testState.dateJst, nowMs: 0 }),
}));

vi.mock("~/features/dashboard/hooks/use-start-session", () => ({
  useStartSession: () => ({ mutate: testState.startMutate }),
}));

vi.mock("~/features/dashboard/hooks/use-pause-session", () => ({
  usePauseSession: () => ({ mutate: testState.pauseMutate }),
}));

vi.mock("~/features/dashboard/hooks/use-resume-session", () => ({
  useResumeSession: () => ({ mutate: testState.resumeMutate }),
}));

vi.mock("~/features/dashboard/hooks/use-complete-session", () => ({
  useCompleteSession: () => ({ mutate: testState.completeMutate }),
}));

const { useDashboardStudy } = await import("~/features/dashboard/hooks/use-dashboard-study");

function callbacksFromCall(mock: ReturnType<typeof vi.fn>) {
  return mock.mock.calls[0]?.[1] as { onError: (error: unknown) => void; onSuccess: () => void };
}

test("starts a session with the given category, dateJst, and planned minutes", () => {
  testState.startMutate.mockClear();
  testState.show.mockClear();
  const { result } = renderHook(() => useDashboardStudy());

  result.current.onStartSession("toeic", 60);

  expect(testState.startMutate).toHaveBeenCalledWith(
    { category: "toeic", dateJst: "2026-07-07", plannedMinutes: 60 },
    expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
  );

  callbacksFromCall(testState.startMutate).onSuccess();
  expect(testState.show).toHaveBeenCalledWith({
    color: "green",
    message: "セッションを開始しました",
    title: "開始しました",
  });
});

test("shows a tailored message when starting fails with SESSION_EXISTS", () => {
  testState.startMutate.mockClear();
  testState.show.mockClear();
  const { result } = renderHook(() => useDashboardStudy());

  result.current.onStartSession("toeic");
  callbacksFromCall(testState.startMutate).onError(new ConvexError("SESSION_EXISTS"));

  expect(testState.show).toHaveBeenCalledWith({
    color: "red",
    message: "進行中のセッションがあります",
    title: "エラー",
  });
});

test("shows a generic message for other start errors", () => {
  testState.startMutate.mockClear();
  testState.show.mockClear();
  const { result } = renderHook(() => useDashboardStudy());

  result.current.onStartSession("toeic");
  callbacksFromCall(testState.startMutate).onError(new Error("boom"));

  expect(testState.show).toHaveBeenCalledWith({
    color: "red",
    message: "開始に失敗しました",
    title: "エラー",
  });
});

test("pauses a session with the given reason", () => {
  testState.pauseMutate.mockClear();
  testState.show.mockClear();
  const { result } = renderHook(() => useDashboardStudy());

  result.current.onPauseSession("dog");
  expect(testState.pauseMutate).toHaveBeenCalledWith(
    { reason: "dog" },
    expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
  );

  callbacksFromCall(testState.pauseMutate).onSuccess();
  expect(testState.show).toHaveBeenCalledWith({
    color: "green",
    message: "セッションを中断しました",
    title: "中断しました",
  });
});

test("resumes a session", () => {
  testState.resumeMutate.mockClear();
  testState.show.mockClear();
  const { result } = renderHook(() => useDashboardStudy());

  result.current.onResumeSession();
  expect(testState.resumeMutate).toHaveBeenCalledWith(
    {},
    expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
  );

  callbacksFromCall(testState.resumeMutate).onSuccess();
  expect(testState.show).toHaveBeenCalledWith({
    color: "green",
    message: "セッションを再開しました",
    title: "再開しました",
  });
});

test("completes a session", () => {
  testState.completeMutate.mockClear();
  testState.show.mockClear();
  const { result } = renderHook(() => useDashboardStudy());

  result.current.onCompleteSession();
  expect(testState.completeMutate).toHaveBeenCalledWith(
    {},
    expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
  );

  callbacksFromCall(testState.completeMutate).onSuccess();
  expect(testState.show).toHaveBeenCalledWith({
    color: "green",
    message: "セッションを完了しました",
    title: "完了しました",
  });
});
