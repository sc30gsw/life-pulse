// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import type { Doc, Id } from "~/../convex/_generated/dataModel";
import {
  SessionStatusGroup,
  SessionStatusGroupFallback,
} from "~/features/dashboard/components/session-status-group";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  toeicCategoryId: "category_toeic" as Id<"studyCategories">,
  onCompleteSession: vi.fn(),
  onPauseSession: vi.fn(),
  onResumeSession: vi.fn(),
  onStartSession: vi.fn(),
  session: null as Doc<"studySessions"> | null,
}));

vi.mock("~/features/dashboard/components/declaration-card", () => ({
  DeclarationCard: () => <div>declaration child</div>,
}));

vi.mock("~/features/dashboard/components/fasting-group", () => ({
  FastingGroup: () => <div>fasting child</div>,
  FastingGroupFallback: () => <div>fasting fallback</div>,
}));

vi.mock("~/features/dashboard/components/session-start-modal", () => ({
  SessionStartModal: ({
    onStart,
    opened,
  }: {
    onStart: (categoryId: Id<"studyCategories">, plannedMinutes: number) => void;
    opened: boolean;
  }) =>
    opened ? (
      <button onClick={() => onStart(hookState.toeicCategoryId, 25)} type="button">
        mock start
      </button>
    ) : null,
}));

vi.mock("~/features/study-categories/hooks/use-study-categories-query", () => ({
  useStudyCategoriesQuery: () => ({
    activeCategories: [
      {
        _creationTime: 0,
        _id: hookState.toeicCategoryId,
        archivedAt: undefined,
        name: "TOEIC",
        sortOrder: 0,
        userId: "user_1" as Id<"appUsers">,
      },
    ],
    categoryName: (categoryId: Id<"studyCategories"> | undefined) =>
      categoryId === hookState.toeicCategoryId ? "TOEIC" : "カテゴリ未設定",
  }),
}));

vi.mock("~/features/dashboard/hooks/use-dashboard-study", () => ({
  useDashboardStudy: () => ({
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
    sessionFlashRef: vi.fn(),
    sessionGoalLabel: "60分",
    sessionProgressPercent: 42,
  }),
}));

function buildSession(overrides: Partial<Doc<"studySessions">> = {}): Doc<"studySessions"> {
  return {
    _creationTime: 0,
    _id: "session_1",
    accumulatedMs: 0,
    categoryId: hookState.toeicCategoryId,
    dateJst: "2026-07-07",
    interruptionCount: 0,
    startedAt: 0,
    status: "active",
    userId: "user_1",
    ...overrides,
  } as unknown as Doc<"studySessions">;
}

test("renders idle state and starts a session through the modal", async () => {
  hookState.session = null;
  hookState.onStartSession.mockClear();
  const user = userEvent.setup();
  const { getByRole, getByText } = renderWithMantine(<SessionStatusGroup />);

  expect(getByText("待機")).toBeDefined();
  expect(getByText("fasting child")).toBeDefined();
  expect(getByText("declaration child")).toBeDefined();

  await user.click(getByRole("button", { name: "セッション開始" }));
  await user.click(getByRole("button", { name: "mock start" }));

  expect(hookState.onStartSession).toHaveBeenCalledWith(hookState.toeicCategoryId, 25);
});

test("active session controls complete and pause with a reason", async () => {
  hookState.session = buildSession({ status: "active" });
  hookState.onCompleteSession.mockClear();
  hookState.onPauseSession.mockClear();
  const user = userEvent.setup();
  const { getByRole, getByText } = renderWithMantine(<SessionStatusGroup />);

  expect(getByText("勉強中")).toBeDefined();
  expect(getByText("TOEIC")).toBeDefined();

  await user.click(getByRole("button", { name: "完了して記録" }));
  await user.click(getByRole("button", { name: "犬" }));

  expect(hookState.onCompleteSession).toHaveBeenCalled();
  expect(hookState.onPauseSession).toHaveBeenCalledWith("dog");
});

test("paused session controls resume and complete", async () => {
  hookState.session = buildSession({ status: "paused" });
  hookState.onCompleteSession.mockClear();
  hookState.onResumeSession.mockClear();
  const user = userEvent.setup();
  const { getByRole, getByText } = renderWithMantine(<SessionStatusGroup />);

  expect(getByText("中断中")).toBeDefined();

  await user.click(getByRole("button", { name: "再開" }));
  await user.click(getByRole("button", { name: "完了" }));

  expect(hookState.onResumeSession).toHaveBeenCalled();
  expect(hookState.onCompleteSession).toHaveBeenCalled();
});

test("SessionStatusGroupFallback renders the loading session summary", () => {
  const { getByText } = renderWithMantine(<SessionStatusGroupFallback />);

  expect(getByText("勉強中")).toBeDefined();
  expect(getByText("TOEIC")).toBeDefined();
  expect(getByText("目標 60分")).toBeDefined();
});
