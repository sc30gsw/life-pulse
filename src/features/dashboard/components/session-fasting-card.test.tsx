// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import type { Doc } from "~/../convex/_generated/dataModel";
import {
  SessionFastingCard,
  SessionFastingCardFallback,
} from "~/features/dashboard/components/session-fasting-card";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  fasting: null as Doc<"fastingWindows"> | null,
  onCompleteSession: vi.fn(),
  onPauseSession: vi.fn(),
  onResumeSession: vi.fn(),
  onStartSession: vi.fn(),
  session: null as Doc<"studySessions"> | null,
  suspendFasting: false,
  suspendStudy: false,
  suspendViewer: false,
  viewerRole: "self" as "partner" | "self",
}));

vi.mock("~/features/dashboard/hooks/use-dashboard-viewer", () => ({
  useDashboardViewer: () => {
    if (hookState.suspendViewer) {
      throw new Promise(() => {});
    }

    return { role: hookState.viewerRole };
  },
}));

vi.mock("~/features/dashboard/hooks/use-dashboard-study", () => ({
  useDashboardStudy: () => {
    if (hookState.suspendStudy) {
      throw new Promise(() => {});
    }

    return {
      declarationActualMinutes: 30,
      declarationActualPercent: 50,
      declarationTotalMinutes: 60,
      declarations: [],
      onCompleteSession: hookState.onCompleteSession,
      onPauseSession: hookState.onPauseSession,
      onResumeSession: hookState.onResumeSession,
      onStartSession: hookState.onStartSession,
      session: hookState.session,
      sessionElapsedLabel: "00:42:00",
      sessionGoalLabel: "60分",
      sessionProgressPercent: 42,
    };
  },
}));

vi.mock("~/features/dashboard/hooks/use-dashboard-fasting", () => ({
  useDashboardFasting: () => {
    if (hookState.suspendFasting) {
      throw new Promise(() => {});
    }

    return {
      fasting: hookState.fasting,
      fastingElapsedLabel: "6h42m",
      fastingRemainLabel: "9h18m",
      fastingRingPercent: 42,
    };
  },
}));

function buildSession(overrides: Partial<Doc<"studySessions">> = {}): Doc<"studySessions"> {
  return {
    _creationTime: 0,
    _id: "session_1",
    accumulatedMs: 0,
    category: "toeic",
    dateJst: "2026-07-07",
    interruptionCount: 0,
    startedAt: 0,
    status: "active",
    userId: "user_1",
    ...overrides,
  } as unknown as Doc<"studySessions">;
}

function buildFasting(overrides: Partial<Doc<"fastingWindows">> = {}): Doc<"fastingWindows"> {
  return {
    _creationTime: 0,
    _id: "fasting_1",
    phase: "early",
    phaseJobIds: [],
    startedAt: 0,
    status: "fasting",
    targetMinutes: 960,
    userId: "user_1",
    ...overrides,
  } as unknown as Doc<"fastingWindows">;
}

test("renders 待機 and a start button when there is no session", () => {
  hookState.viewerRole = "self";
  hookState.session = null;
  hookState.fasting = null;
  hookState.suspendFasting = false;
  hookState.suspendStudy = false;
  hookState.suspendViewer = false;

  const { getByText, getByRole } = renderWithMantine(<SessionFastingCard sessionFlash={false} />);

  expect(getByText("待機")).toBeDefined();
  expect(getByRole("button", { name: "セッション開始" })).toBeDefined();
  expect(getByText("YOU")).toBeDefined();
});

test("renders an active session and fasting status", () => {
  hookState.session = buildSession({ status: "active" });
  hookState.fasting = buildFasting({ phase: "early" });

  const { getByText, getByRole } = renderWithMantine(<SessionFastingCard sessionFlash={false} />);

  expect(getByText("勉強中")).toBeDefined();
  expect(getByText("TOEIC")).toBeDefined();
  expect(getByRole("button", { name: "完了して記録" })).toBeDefined();
  expect(getByText("空腹期")).toBeDefined();
});

test("renders paused session controls", () => {
  hookState.session = buildSession({ status: "paused" });
  hookState.fasting = null;

  const { getByRole, getByText } = renderWithMantine(<SessionFastingCard sessionFlash={false} />);

  expect(getByText("中断中")).toBeDefined();
  expect(getByRole("button", { name: "再開" })).toBeDefined();
  expect(getByRole("button", { name: "完了" })).toBeDefined();
});

test("renders completed and abandoned session labels", () => {
  hookState.session = buildSession({ status: "completed" });
  hookState.fasting = null;

  const completed = renderWithMantine(<SessionFastingCard sessionFlash={false} />);
  expect(completed.getByText("完了")).toBeDefined();
  completed.unmount();

  hookState.session = buildSession({ status: "abandoned" });

  const abandoned = renderWithMantine(<SessionFastingCard sessionFlash={false} />);
  expect(abandoned.getByText("放置終了")).toBeDefined();
});

test("renders fasting fatburn and goal phases", () => {
  hookState.session = null;
  hookState.fasting = buildFasting({ phase: "fatburn" });

  const fatburn = renderWithMantine(<SessionFastingCard sessionFlash={false} />);
  expect(fatburn.getByText("脂肪燃焼帯")).toBeDefined();
  expect(fatburn.getByText("16hで目標達成")).toBeDefined();
  fatburn.unmount();

  hookState.fasting = buildFasting({ phase: "goal" });

  const goal = renderWithMantine(<SessionFastingCard sessionFlash={false} />);
  expect(goal.getByText("目標達成")).toBeDefined();
  expect(goal.getByText("16時間クリア")).toBeDefined();
});

test("hides the YOU badge outside self view", () => {
  hookState.viewerRole = "partner";
  hookState.session = null;
  hookState.fasting = null;

  const { queryByText } = renderWithMantine(<SessionFastingCard sessionFlash={false} />);

  expect(queryByText("YOU")).toBeNull();
});

test("renders a structure-aware shimmer fallback", () => {
  const { getByText } = renderWithMantine(<SessionFastingCardFallback />);

  expect(getByText("本人 · 発注者")).toBeDefined();
  expect(getByText("勉強中")).toBeDefined();
  expect(getByText("今日の学習")).toBeDefined();
});

test("renders nested Suspense fallbacks while viewer, study, and fasting reads suspend", () => {
  hookState.suspendFasting = true;
  hookState.suspendStudy = true;
  hookState.suspendViewer = true;

  const { getByText } = renderWithMantine(<SessionFastingCard sessionFlash={false} />);

  expect(getByText("YOU")).toBeDefined();
  expect(getByText("勉強中")).toBeDefined();
  expect(getByText("空腹期")).toBeDefined();
});

test("clicking a pause reason calls onPauseSession with that reason", async () => {
  hookState.viewerRole = "self";
  hookState.session = buildSession({ status: "active" });
  hookState.fasting = null;
  hookState.suspendFasting = false;
  hookState.suspendStudy = false;
  hookState.suspendViewer = false;
  hookState.onPauseSession.mockClear();

  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(<SessionFastingCard sessionFlash={false} />);

  await user.click(getByRole("button", { name: "犬" }));

  expect(hookState.onPauseSession).toHaveBeenCalledWith("dog");
});

test("clicking 完了して記録 calls onCompleteSession for an active session", async () => {
  hookState.session = buildSession({ status: "active" });
  hookState.onCompleteSession.mockClear();

  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(<SessionFastingCard sessionFlash={false} />);

  await user.click(getByRole("button", { name: "完了して記録" }));

  expect(hookState.onCompleteSession).toHaveBeenCalled();
});

test("resume and complete controls call onResumeSession and onCompleteSession for a paused session", async () => {
  hookState.session = buildSession({ status: "paused" });
  hookState.onResumeSession.mockClear();
  hookState.onCompleteSession.mockClear();

  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(<SessionFastingCard sessionFlash={false} />);

  await user.click(getByRole("button", { name: "再開" }));
  expect(hookState.onResumeSession).toHaveBeenCalled();

  await user.click(getByRole("button", { name: "完了" }));
  expect(hookState.onCompleteSession).toHaveBeenCalled();
});

test("opens the start modal and submits the default category and planned minutes", async () => {
  hookState.session = null;
  hookState.onStartSession.mockClear();

  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(<SessionFastingCard sessionFlash={false} />);

  await user.click(getByRole("button", { name: "セッション開始" }));
  await user.click(getByRole("button", { name: "開始する" }));

  expect(hookState.onStartSession).toHaveBeenCalledWith("toeic", 60);
});

test("submits the category selected in the start modal", async () => {
  hookState.session = null;
  hookState.onStartSession.mockClear();

  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(<SessionFastingCard sessionFlash={false} />);

  await user.click(getByRole("button", { name: "セッション開始" }));
  await user.click(getByRole("button", { name: "英会話" }));
  await user.click(getByRole("button", { name: "開始する" }));

  expect(hookState.onStartSession).toHaveBeenCalledWith("eikaiwa", 60);
});
