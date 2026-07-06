// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";

const {
  useSuspenseQueryMock,
  modalsOpenConfirmModalMock,
  notificationsShowMock,
  logDogEventMutateMock,
  setPresenceMutateMock,
  undoDogEventMutateMock,
  todayJstMock,
  toDateJstMock,
} = vi.hoisted(() => ({
  logDogEventMutateMock: vi.fn(),
  modalsOpenConfirmModalMock: vi.fn(),
  notificationsShowMock: vi.fn(),
  setPresenceMutateMock: vi.fn(),
  toDateJstMock: vi.fn(() => "2026-07-07"),
  todayJstMock: vi.fn(() => "2026-07-07"),
  undoDogEventMutateMock: vi.fn(),
  useSuspenseQueryMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({ useSuspenseQuery: useSuspenseQueryMock }));
vi.mock("@mantine/modals", () => ({ modals: { openConfirmModal: modalsOpenConfirmModalMock } }));
vi.mock("@mantine/notifications", () => ({ notifications: { show: notificationsShowMock } }));
vi.mock("~/features/dashboard/hooks/use-log-dog-event", () => ({
  useLogDogEvent: () => ({ mutate: logDogEventMutateMock }),
}));
vi.mock("~/features/dashboard/hooks/use-set-presence", () => ({
  useSetPresence: () => ({ mutate: setPresenceMutateMock }),
}));
vi.mock("~/features/dashboard/hooks/use-undo-dog-event", () => ({
  useUndoDogEvent: () => ({ mutate: undoDogEventMutateMock }),
}));
vi.mock("~/utils/date-jst", () => ({ toDateJst: toDateJstMock, todayJst: todayJstMock }));
vi.mock("~/features/dashboard/api/dashboard-live-query", () => ({
  dashboardDogQuery: (dateJst: string) => ({ __q: "dog", dateJst }),
  dashboardFastingQuery: () => ({ __q: "fasting" }),
  dashboardHealthQuery: (dateJst: string) => ({ __q: "health", dateJst }),
  dashboardPresenceQuery: () => ({ __q: "presence" }),
  dashboardStudyQuery: (dateJst: string) => ({ __q: "study", dateJst }),
  dashboardViewerQuery: () => ({ __q: "viewer" }),
}));

const { useLiveBoard } = await import("~/features/dashboard/hooks/use-live-board");

function useHookUnderTest() {
  return useLiveBoard();
}

const FIXED_NOW = 600_000;

let mockData: Record<string, unknown>;

function setMockData(overrides: Partial<typeof mockData> = {}) {
  mockData = {
    dog: { dogName: "ハマロ", events: [] },
    fasting: null,
    health: null,
    presence: null,
    study: { blocks: [], session: null, todayActualMinutes: 0 },
    viewer: { displayName: "本人", role: "self" },
    ...overrides,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
  vi.clearAllMocks();
  todayJstMock.mockReturnValue("2026-07-07");
  toDateJstMock.mockReturnValue("2026-07-07");
  useSuspenseQueryMock.mockImplementation((opts: { __q: string }) => ({
    data: mockData[opts.__q],
  }));
  setMockData();
});

afterEach(() => {
  vi.useRealTimers();
});

test("returns idle defaults when there is no session, fasting, health, or partner presence", () => {
  const { result } = renderHook(useHookUnderTest);

  expect(result.current.session).toBeNull();
  expect(result.current.sessionElapsedLabel).toBe("00:00");
  expect(result.current.sessionGoalLabel).toBe("0分");
  expect(result.current.sessionProgressPercent).toBe(0);
  expect(result.current.fasting).toBeNull();
  expect(result.current.fastingElapsedLabel).toBe("0m");
  expect(result.current.fastingRingPercent).toBe(0);
  expect(result.current.lastSyncRelativeLabel).toBe("未同期");
  expect(result.current.partner).toBeNull();
  expect(result.current.partnerUpdatedRelativeLabel).toBe("未更新");
  expect(result.current.isSelfView).toBe(true);
  expect(result.current.isPartnerView).toBe(false);
  expect(result.current.declarationTotalMinutes).toBe(0);
  expect(result.current.declarationActualPercent).toBe(0);
});

test("derives full computed values from active session, fasting, dog, health, and partner data", () => {
  setMockData({
    dog: {
      dogName: "ハマロ",
      events: [{ at: 0, byRole: "self", id: "event_1", kind: "walk_am" }],
    },
    fasting: { phase: "early", startedAt: 0, targetMinutes: 960 },
    health: { source: "garmin", syncedAt: 0 },
    presence: { etaHm: undefined, state: "home", updatedAt: 0 },
    study: {
      blocks: [{ category: "toeic", plannedMinutes: 30, startHm: "06:00", status: "planned" }],
      session: {
        accumulatedMs: 0,
        category: "toeic",
        interruptionCount: 0,
        plannedMinutes: 30,
        startedAt: 0,
        status: "active",
      },
      todayActualMinutes: 10,
    },
    viewer: { displayName: "パートナー", role: "partner" },
  });

  const { result } = renderHook(useHookUnderTest);

  expect(result.current.session?.status).toBe("active");
  expect(result.current.sessionElapsedLabel).toBe("10:00");
  expect(result.current.sessionGoalLabel).toBe("30分");
  expect(result.current.sessionProgressPercent).toBe(33);
  expect(result.current.dogName).toBe("ハマロ");
  expect(result.current.dogCare.find((item) => item.kind === "walk_am")?.done).toBe(true);
  expect(result.current.metrics?.source).toBe("garmin");
  expect(result.current.lastSyncRelativeLabel).toBe("10分前");
  expect(result.current.partner?.state).toBe("home");
  expect(result.current.partnerUpdatedRelativeLabel).toBe("10分前");
  expect(result.current.isPartnerView).toBe(true);
  expect(result.current.isSelfView).toBe(false);
  expect(result.current.fastingElapsedLabel).toBe("10m");
  expect(result.current.fastingRemainLabel).toBe("15h50m");
  expect(result.current.fastingRingPercent).toBe(1);
  expect(result.current.declarationTotalMinutes).toBe(30);
  expect(result.current.declarationActualMinutes).toBe(20);
  expect(result.current.declarationActualPercent).toBe(67);
});

test("falls back the fasting target to the default when unset", () => {
  setMockData({ fasting: { phase: "early", startedAt: 0, targetMinutes: undefined } });

  const { result } = renderHook(useHookUnderTest);

  // DEFAULT_FASTING_TARGET_MINUTES (960) - 10 elapsed minutes = 950 -> 15h50m.
  expect(result.current.fastingRemainLabel).toBe("15h50m");
});

test("onToggleTheme flips the theme and updates the document dataset", () => {
  const { result } = renderHook(useHookUnderTest);
  expect(result.current.theme).toBe("dark");

  act(() => {
    result.current.onToggleTheme();
  });

  expect(result.current.theme).toBe("light");
  expect(document.documentElement.dataset.theme).toBe("light");
});

test("onToggleDogCare is a no-op for a kind outside the fixed checklist", () => {
  const { result } = renderHook(useHookUnderTest);

  act(() => {
    result.current.onToggleDogCare("toilet");
  });

  expect(logDogEventMutateMock).not.toHaveBeenCalled();
  expect(undoDogEventMutateMock).not.toHaveBeenCalled();
  expect(modalsOpenConfirmModalMock).not.toHaveBeenCalled();
});

test("onToggleDogCare starts a log mutation for a pending kind and toasts on success", () => {
  const { result } = renderHook(useHookUnderTest);

  act(() => {
    result.current.onToggleDogCare("walk_am");
  });

  expect(logDogEventMutateMock).toHaveBeenCalledWith(
    { dateJst: "2026-07-07", kind: "walk_am" },
    expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
  );

  const { onSuccess } = logDogEventMutateMock.mock.calls[0]![1];
  act(() => {
    onSuccess();
  });

  expect(result.current.toasts).toHaveLength(1);
  expect(result.current.toasts[0]).toMatchObject({
    accent: "coral",
    text: "ハマロの朝散歩 ✓ 記録",
    who: "自分の操作",
  });
});

test("onToggleDogCare shows an error notification when the log mutation fails", () => {
  const { result } = renderHook(useHookUnderTest);

  act(() => {
    result.current.onToggleDogCare("walk_am");
  });

  const { onError } = logDogEventMutateMock.mock.calls[0]![1];
  act(() => {
    onError();
  });

  expect(notificationsShowMock).toHaveBeenCalledWith({
    color: "red",
    message: "記録に失敗しました",
    title: "エラー",
  });
  expect(result.current.toasts).toHaveLength(0);
});

test("onToggleDogCare opens a confirm modal for a done kind and undoes it on confirm", () => {
  setMockData({
    dog: {
      dogName: "ハマロ",
      events: [{ at: 0, byRole: "self", id: "event_1", kind: "walk_am" }],
    },
  });
  const { result } = renderHook(useHookUnderTest);

  act(() => {
    result.current.onToggleDogCare("walk_am");
  });

  expect(modalsOpenConfirmModalMock).toHaveBeenCalledTimes(1);
  const { onConfirm } = modalsOpenConfirmModalMock.mock.calls[0]![0];

  act(() => {
    onConfirm();
  });

  expect(undoDogEventMutateMock).toHaveBeenCalledWith(
    { dateJst: "2026-07-07", eventId: "event_1" },
    expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
  );

  const { onSuccess } = undoDogEventMutateMock.mock.calls[0]![1];
  act(() => {
    onSuccess();
  });

  expect(result.current.toasts[0]).toMatchObject({ accent: "faint", text: "ハマロの朝散歩 取消" });
});

test("onToggleDogCare's undo shows an error notification when the mutation fails", () => {
  setMockData({
    dog: {
      dogName: "ハマロ",
      events: [{ at: 0, byRole: "self", id: "event_1", kind: "walk_am" }],
    },
  });
  const { result } = renderHook(useHookUnderTest);

  act(() => {
    result.current.onToggleDogCare("walk_am");
  });
  const { onConfirm } = modalsOpenConfirmModalMock.mock.calls[0]![0];
  act(() => {
    onConfirm();
  });
  const { onError } = undoDogEventMutateMock.mock.calls[0]![1];
  act(() => {
    onError();
  });

  expect(notificationsShowMock).toHaveBeenCalledWith({
    color: "red",
    message: "取消に失敗しました",
    title: "エラー",
  });
});

test("onSetPresence starts a mutation with state and etaHm, toasting on success", () => {
  const { result } = renderHook(useHookUnderTest);

  act(() => {
    result.current.onSetPresence("commuting_home", "20:30");
  });

  expect(setPresenceMutateMock).toHaveBeenCalledWith(
    { etaHm: "20:30", state: "commuting_home" },
    expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
  );

  const { onSuccess } = setPresenceMutateMock.mock.calls[0]![1];
  act(() => {
    onSuccess();
  });

  expect(result.current.toasts[0]).toMatchObject({ text: "パートナー: commuting_home" });
});

test("onSetPresence shows an error notification when the mutation fails", () => {
  const { result } = renderHook(useHookUnderTest);

  act(() => {
    result.current.onSetPresence("home");
  });

  expect(setPresenceMutateMock).toHaveBeenCalledWith(
    { etaHm: undefined, state: "home" },
    expect.anything(),
  );

  const { onError } = setPresenceMutateMock.mock.calls[0]![1];
  act(() => {
    onError();
  });

  expect(notificationsShowMock).toHaveBeenCalledWith({
    color: "red",
    message: "更新に失敗しました",
    title: "エラー",
  });
});

test("caps toasts at MAX_TOASTS, dropping the oldest", () => {
  const { result } = renderHook(useHookUnderTest);

  for (const kind of ["walk_am", "meal_am", "meds", "walk_pm", "meal_pm"] as const) {
    act(() => {
      result.current.onToggleDogCare(kind);
    });
    const lastCall = logDogEventMutateMock.mock.calls.at(-1) as [
      unknown,
      { onSuccess: () => void },
    ];
    act(() => {
      lastCall[1].onSuccess();
    });
  }

  expect(result.current.toasts).toHaveLength(4);
});

test("removes a toast automatically after its lifetime elapses", () => {
  const { result } = renderHook(useHookUnderTest);

  act(() => {
    result.current.onSetPresence("home");
  });
  const { onSuccess } = setPresenceMutateMock.mock.calls[0]![1];
  act(() => {
    onSuccess();
  });
  expect(result.current.toasts).toHaveLength(1);

  act(() => {
    vi.advanceTimersByTime(4_200);
  });

  expect(result.current.toasts).toHaveLength(0);
});

test("ticks the clock every second and re-points card queries on a JST day rollover", () => {
  renderHook(useHookUnderTest);

  expect(useSuspenseQueryMock).toHaveBeenCalledWith(
    expect.objectContaining({ __q: "study", dateJst: "2026-07-07" }),
  );

  toDateJstMock.mockReturnValue("2026-07-08");
  act(() => {
    vi.advanceTimersByTime(1_000);
  });

  expect(useSuspenseQueryMock).toHaveBeenCalledWith(
    expect.objectContaining({ __q: "study", dateJst: "2026-07-08" }),
  );
});
