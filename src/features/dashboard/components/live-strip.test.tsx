// @vitest-environment happy-dom
import { expect, test } from "vite-plus/test";

import { LiveStrip } from "~/features/dashboard/components/live-strip";
import { renderWithMantine } from "~/test-utils";

test("renders the last-sync relative label", () => {
  const { getByText } = renderWithMantine(<LiveStrip lastSyncRelativeLabel="5分前" />);

  expect(getByText("5分前")).toBeDefined();
});

test("renders the static Convex live-sync and 2-device labels", () => {
  const { getByText } = renderWithMantine(<LiveStrip lastSyncRelativeLabel="たった今" />);

  expect(getByText("Convex ライブ同期")).toBeDefined();
  expect(getByText("2端末デモ対応 · モバイル/デスクトップ")).toBeDefined();
});
