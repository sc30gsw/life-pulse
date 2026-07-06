// @vitest-environment happy-dom
import type { ComponentProps } from "react";
import { expect, test, vi } from "vite-plus/test";

import type { Doc } from "~/../convex/_generated/dataModel";
import { SessionFastingCardView } from "~/features/dashboard/components/session-fasting-card";
import { renderWithMantine } from "~/test-utils";

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

const BASE_PROPS: ComponentProps<typeof SessionFastingCardView> = {
  declarationActualMinutes: 30,
  declarationActualPercent: 50,
  declarationTotalMinutes: 60,
  declarations: [],
  fasting: null,
  fastingElapsedLabel: "0m",
  fastingFlash: false,
  fastingRemainLabel: "16h00m",
  fastingRingPercent: 0,
  isSelfView: false,
  onCompleteSession: vi.fn(),
  onPauseSession: vi.fn(),
  onResumeSession: vi.fn(),
  onStartSession: vi.fn(),
  session: null,
  sessionElapsedLabel: "00:00",
  sessionFlash: false,
  sessionGoalLabel: "0分",
  sessionProgressPercent: 0,
};

test("renders 待機 and a start button when there is no session (idle)", () => {
  const { getByText, getByRole } = renderWithMantine(<SessionFastingCardView {...BASE_PROPS} />);

  expect(getByText("待機")).toBeDefined();
  expect(getByRole("button", { name: "セッション開始" })).toBeDefined();
});

test("renders 勉強中, category, and pause reasons for an active session", () => {
  const { getByText, getByRole } = renderWithMantine(
    <SessionFastingCardView {...BASE_PROPS} session={buildSession({ status: "active" })} />,
  );

  expect(getByText("勉強中")).toBeDefined();
  expect(getByText("TOEIC")).toBeDefined();
  expect(getByRole("button", { name: "完了して記録" })).toBeDefined();
  expect(getByRole("button", { name: "仕事" })).toBeDefined();
  expect(getByRole("button", { name: "犬" })).toBeDefined();
  expect(getByRole("button", { name: "家事" })).toBeDefined();
});

test("renders 中断中 and resume/complete buttons for a paused session", () => {
  const { getByText, getByRole } = renderWithMantine(
    <SessionFastingCardView {...BASE_PROPS} session={buildSession({ status: "paused" })} />,
  );

  expect(getByText("中断中")).toBeDefined();
  expect(getByRole("button", { name: "再開" })).toBeDefined();
  expect(getByRole("button", { name: "完了" })).toBeDefined();
});

test("renders 完了 and a start button for a completed session", () => {
  const { getByText, getByRole } = renderWithMantine(
    <SessionFastingCardView {...BASE_PROPS} session={buildSession({ status: "completed" })} />,
  );

  expect(getByText("完了")).toBeDefined();
  expect(getByRole("button", { name: "セッション開始" })).toBeDefined();
});

test("renders 放置終了 for an abandoned session", () => {
  const { getByText } = renderWithMantine(
    <SessionFastingCardView {...BASE_PROPS} session={buildSession({ status: "abandoned" })} />,
  );

  expect(getByText("放置終了")).toBeDefined();
});

test("shows the YOU badge in self view", () => {
  const { getByText } = renderWithMantine(
    <SessionFastingCardView {...BASE_PROPS} isSelfView={true} />,
  );

  expect(getByText("YOU")).toBeDefined();
});

test("hides the YOU badge outside self view", () => {
  const { queryByText } = renderWithMantine(
    <SessionFastingCardView {...BASE_PROPS} isSelfView={false} />,
  );

  expect(queryByText("YOU")).toBeNull();
});

test("renders 未開始 when fasting is null", () => {
  const { getByText } = renderWithMantine(
    <SessionFastingCardView {...BASE_PROPS} fasting={null} />,
  );

  expect(getByText("未開始")).toBeDefined();
  expect(getByText("断食を開始していません")).toBeDefined();
});

test("renders the early-phase label and sub-label when fasting", () => {
  const { getByText } = renderWithMantine(
    <SessionFastingCardView {...BASE_PROPS} fasting={buildFasting({ phase: "early" })} />,
  );

  expect(getByText("空腹期")).toBeDefined();
  expect(getByText("12hで脂肪燃焼帯")).toBeDefined();
});

test("renders the fatburn-phase label and sub-label when fasting", () => {
  const { getByText } = renderWithMantine(
    <SessionFastingCardView {...BASE_PROPS} fasting={buildFasting({ phase: "fatburn" })} />,
  );

  expect(getByText("脂肪燃焼帯")).toBeDefined();
  expect(getByText("16hで目標達成")).toBeDefined();
});

test("renders the goal-phase label and sub-label when fasting", () => {
  const { getByText } = renderWithMantine(
    <SessionFastingCardView {...BASE_PROPS} fasting={buildFasting({ phase: "goal" })} />,
  );

  expect(getByText("目標達成")).toBeDefined();
  expect(getByText("16時間クリア")).toBeDefined();
});
