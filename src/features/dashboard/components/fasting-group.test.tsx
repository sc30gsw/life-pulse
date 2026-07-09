// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import type { Doc } from "~/../convex/_generated/dataModel";
import { FastingGroup, FastingGroupFallback } from "~/features/dashboard/components/fasting-group";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  endMutate: vi.fn(),
  fasting: null as Doc<"fastingWindows"> | null,
  openConfirmModal: vi.fn(),
  startMutate: vi.fn(),
  viewerRole: "self" as "partner" | "self",
}));

vi.mock("~/features/dashboard/hooks/use-dashboard-fasting", () => ({
  useDashboardFasting: () => ({
    fasting: hookState.fasting,
    fastingElapsedLabel: "6:42:00",
    fastingRemainLabel: "9:18:00",
    fastingRingPercent: 42,
  }),
}));

vi.mock("~/features/dashboard/hooks/use-dashboard-viewer", () => ({
  useDashboardViewer: () => ({ role: hookState.viewerRole }),
}));

vi.mock("~/features/fasting/hooks/use-end-fasting", () => ({
  useEndFasting: () => ({ mutate: hookState.endMutate }),
}));

vi.mock("~/features/fasting/hooks/use-start-fasting", () => ({
  useStartFasting: () => ({ mutate: hookState.startMutate }),
}));

vi.mock("@mantine/modals", () => ({
  modals: { openConfirmModal: hookState.openConfirmModal },
}));

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

test("renders 未開始 when there is no active fasting window", () => {
  hookState.fasting = null;

  const { getByText } = renderWithMantine(<FastingGroup fastingFlash={false} />);

  expect(getByText("未開始")).toBeDefined();
  expect(getByText("断食を開始していません")).toBeDefined();
});

test("renders fatburn and goal fasting phases", () => {
  hookState.fasting = buildFasting({ phase: "fatburn" });

  const fatburn = renderWithMantine(<FastingGroup fastingFlash={false} />);
  expect(fatburn.getByText("脂肪燃焼帯")).toBeDefined();
  expect(fatburn.getByText("16hで目標達成")).toBeDefined();
  fatburn.unmount();

  hookState.fasting = buildFasting({ phase: "goal" });

  const goal = renderWithMantine(<FastingGroup fastingFlash={false} />);
  expect(goal.getByText("目標達成")).toBeDefined();
  expect(goal.getByText("16時間クリア")).toBeDefined();
});

test("renders a structure-aware shimmer fallback", () => {
  const { getByText } = renderWithMantine(<FastingGroupFallback />);

  expect(getByText("断食")).toBeDefined();
  expect(getByText("空腹期")).toBeDefined();
});

test("shows a 断食開始 button for the self viewer when there is no active fasting window", () => {
  hookState.viewerRole = "self";
  hookState.fasting = null;

  const { getByRole, queryByRole } = renderWithMantine(<FastingGroup fastingFlash={false} />);

  expect(getByRole("button", { name: "断食開始" })).toBeDefined();
  expect(queryByRole("button", { name: "食事開始(断食終了)" })).toBeNull();
});

test("shows a 食事開始(断食終了) button for the self viewer with an active window, and confirming it calls the end mutation", async () => {
  hookState.viewerRole = "self";
  hookState.fasting = buildFasting({ phase: "early" });
  hookState.openConfirmModal.mockClear();
  hookState.endMutate.mockClear();

  const user = userEvent.setup();
  const { getByRole, queryByRole } = renderWithMantine(<FastingGroup fastingFlash={false} />);

  expect(queryByRole("button", { name: "断食開始" })).toBeNull();

  await user.click(getByRole("button", { name: "食事開始(断食終了)" }));

  expect(hookState.openConfirmModal).toHaveBeenCalledWith(
    expect.objectContaining({
      labels: { cancel: "キャンセル", confirm: "食事開始(断食終了)" },
      title: "断食を終了しますか?",
    }),
  );

  const modal = hookState.openConfirmModal.mock.calls[0]?.[0] as { onConfirm: () => void };
  modal.onConfirm();

  expect(hookState.endMutate).toHaveBeenCalledWith(
    {},
    expect.objectContaining({ onError: expect.any(Function) }),
  );
});

test("hides both fasting action buttons for the partner viewer", () => {
  hookState.viewerRole = "partner";
  hookState.fasting = null;

  const noWindow = renderWithMantine(<FastingGroup fastingFlash={false} />);
  expect(noWindow.queryByRole("button", { name: "断食開始" })).toBeNull();
  expect(noWindow.queryByRole("button", { name: "食事開始(断食終了)" })).toBeNull();
  noWindow.unmount();

  hookState.fasting = buildFasting({ phase: "early" });

  const active = renderWithMantine(<FastingGroup fastingFlash={false} />);
  expect(active.queryByRole("button", { name: "断食開始" })).toBeNull();
  expect(active.queryByRole("button", { name: "食事開始(断食終了)" })).toBeNull();
});
