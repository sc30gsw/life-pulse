// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import type { Doc } from "~/../convex/_generated/dataModel";
import {
  FastingStatusCard,
  FastingStatusCardFallback,
} from "~/features/fasting/components/fasting-status-card";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  endMutate: vi.fn(),
  fasting: null as Doc<"fastingWindows"> | null,
  openConfirmModal: vi.fn(),
  startMutate: vi.fn(),
  viewerRole: "self" as "partner" | "self",
}));

vi.mock("~/features/dashboard/hooks/use-board-clock", () => ({
  useBoardClock: () => ({ nowMs: 120 * 60_000 }),
}));

vi.mock("~/features/fasting/hooks/use-fasting-window", () => ({
  useFastingWindow: () => ({ data: hookState.fasting }),
}));

vi.mock("~/features/auth/hooks/use-viewer", () => ({
  useViewer: () => ({ data: { role: hookState.viewerRole } }),
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
    startedAt: Date.now() - 120 * 60_000,
    status: "fasting",
    targetMinutes: 960,
    userId: "user_1",
    ...overrides,
  } as unknown as Doc<"fastingWindows">;
}

test("renders 未開始 and the elapsed/remaining/target labels when there is no active window", () => {
  hookState.fasting = null;

  const { getByText } = renderWithMantine(<FastingStatusCard />);

  expect(getByText("未開始")).toBeDefined();
  expect(getByText("00:00")).toBeDefined();
  expect(getByText("16:00:00")).toBeDefined();
  expect(getByText("16h00m")).toBeDefined();
});

test("renders the phase timeline steps regardless of fasting state", () => {
  hookState.fasting = buildFasting({ phase: "fatburn" });

  const { getAllByText, getByText } = renderWithMantine(<FastingStatusCard />);

  expect(getByText("空腹期")).toBeDefined();
  // The current-phase badge repeats the phase label already shown as a timeline title.
  expect(getAllByText("脂肪燃焼帯").length).toBe(2);
  expect(getByText("目標達成")).toBeDefined();
});

test("shows a 断食開始 button for the self viewer when there is no active window", () => {
  hookState.viewerRole = "self";
  hookState.fasting = null;

  const { getByRole, queryByRole } = renderWithMantine(<FastingStatusCard />);

  expect(getByRole("button", { name: "断食開始" })).toBeDefined();
  expect(queryByRole("button", { name: "食事開始(断食終了)" })).toBeNull();
});

test("shows a 食事開始(断食終了) button for the self viewer with an active window, and confirming it calls the end mutation", async () => {
  hookState.viewerRole = "self";
  hookState.fasting = buildFasting({ phase: "early" });
  hookState.openConfirmModal.mockClear();
  hookState.endMutate.mockClear();

  const user = userEvent.setup();
  const { getByRole, queryByRole } = renderWithMantine(<FastingStatusCard />);

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

  expect(hookState.endMutate).toHaveBeenCalledWith({});
});

test("hides both fasting action buttons for the partner viewer", () => {
  hookState.viewerRole = "partner";
  hookState.fasting = null;

  const noWindow = renderWithMantine(<FastingStatusCard />);
  expect(noWindow.queryByRole("button", { name: "断食開始" })).toBeNull();
  expect(noWindow.queryByRole("button", { name: "食事開始(断食終了)" })).toBeNull();
  noWindow.unmount();

  hookState.fasting = buildFasting({ phase: "early" });

  const active = renderWithMantine(<FastingStatusCard />);
  expect(active.queryByRole("button", { name: "断食開始" })).toBeNull();
  expect(active.queryByRole("button", { name: "食事開始(断食終了)" })).toBeNull();
});

test("renders a structure-aware shimmer fallback", () => {
  const { getAllByText } = renderWithMantine(<FastingStatusCardFallback />);

  // The current-phase badge repeats the phase label already shown as a timeline title.
  expect(getAllByText("空腹期").length).toBe(2);
});
