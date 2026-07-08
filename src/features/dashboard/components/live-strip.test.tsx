// @vitest-environment happy-dom
import { expect, test, vi } from "vite-plus/test";

import { LiveStrip } from "~/features/dashboard/components/live-strip";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  suspendHealth: false,
}));

vi.mock("~/features/dashboard/hooks/use-dashboard-health", () => ({
  useDashboardHealth: () => {
    if (hookState.suspendHealth) {
      throw new Promise(() => {});
    }

    return { lastSyncRelativeLabel: "5分前", metrics: null };
  },
}));

test("renders the last-sync relative label", () => {
  hookState.suspendHealth = false;

  const { getByText } = renderWithMantine(<LiveStrip />);

  expect(getByText("5分前")).toBeDefined();
});

test("renders the last-sync fallback while the health query suspends", () => {
  hookState.suspendHealth = true;

  const { getByText } = renderWithMantine(<LiveStrip />);

  expect(getByText("たった今")).toBeDefined();
});

test("renders the static Convex live-sync and app-scope labels", () => {
  const { getByText } = renderWithMantine(<LiveStrip />);

  expect(getByText("Convex ライブ同期")).toBeDefined();
  expect(getByText("健康 · 学習 · 断食を一元管理")).toBeDefined();
});
