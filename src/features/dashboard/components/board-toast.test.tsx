// @vitest-environment happy-dom
import { expect, test } from "vite-plus/test";

import { BoardToast } from "~/features/dashboard/components/board-toast";
import { renderWithMantine } from "~/test-utils";

test("renders nothing when there are no toasts", () => {
  const { queryByRole } = renderWithMantine(<BoardToast toasts={[]} />);

  expect(queryByRole("status")).toBeNull();
});

test("renders each toast's text and who", () => {
  const { getByText } = renderWithMantine(
    <BoardToast
      toasts={[
        { accent: "coral", id: 1, text: "ハマロの朝散歩 ✓ 記録", who: "自分の操作" },
        { accent: "blue", id: 2, text: "パートナー: home", who: "自分の操作" },
      ]}
    />,
  );

  expect(getByText("ハマロの朝散歩 ✓ 記録")).toBeDefined();
  expect(getByText("パートナー: home")).toBeDefined();
});

test("renders a live status region with the toasts", () => {
  const { getByRole } = renderWithMantine(
    <BoardToast toasts={[{ accent: "good", id: 1, text: "完了", who: "自分の操作" }]} />,
  );

  expect(getByRole("status")).toBeDefined();
});
