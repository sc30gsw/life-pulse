// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import {
  GarminSyncCard,
  GarminSyncCardFallback,
} from "~/features/health/components/garmin-sync-card";
import { renderWithMantine } from "~/test-utils";

const hookState = vi.hoisted(() => ({
  lastSync: null as { at: number; message?: string; ok: boolean } | null,
  mutate: vi.fn(),
}));

vi.mock("~/features/health/hooks/use-last-sync", () => ({
  useLastSync: () => ({ data: hookState.lastSync }),
}));

vi.mock("~/features/health/hooks/use-request-garmin-sync", () => ({
  useRequestGarminSync: () => ({ isPending: false, mutate: hookState.mutate }),
}));

test("shows the empty state when no syncs have happened yet", () => {
  hookState.lastSync = null;

  const { getByText } = renderWithMantine(<GarminSyncCard />);

  expect(getByText("未同期")).toBeDefined();
  expect(getByText("まだ同期していません")).toBeDefined();
});

test("shows the last sync's relative time and success status", () => {
  hookState.lastSync = { at: Date.now() - 5 * 60_000, ok: true };

  const { getByText } = renderWithMantine(<GarminSyncCard />);

  expect(getByText("成功")).toBeDefined();
  expect(getByText("最終同期 5分前")).toBeDefined();
});

test("shows failure status and the error message", () => {
  hookState.lastSync = { at: Date.now() - 60_000, message: "認証エラー", ok: false };

  const { getByText } = renderWithMantine(<GarminSyncCard />);

  expect(getByText("失敗")).toBeDefined();
  expect(getByText("認証エラー")).toBeDefined();
});

test("clicking the sync button calls the mutation", async () => {
  hookState.lastSync = null;
  hookState.mutate.mockClear();
  const user = userEvent.setup();

  const { getByRole } = renderWithMantine(<GarminSyncCard />);

  await user.click(getByRole("button", { name: "今すぐ同期" }));

  expect(hookState.mutate).toHaveBeenCalledTimes(1);
  const [payload] = hookState.mutate.mock.calls[0] as [Record<string, unknown>];
  expect(payload).toEqual({});
});

test("renders the fallback structure", () => {
  const { getByText } = renderWithMantine(<GarminSyncCardFallback />);

  expect(getByText("今すぐ同期")).toBeDefined();
});
