// @vitest-environment happy-dom
import { expect, test } from "vite-plus/test";

import { ProfileFormFallback } from "~/features/profile/components/profile-form-fallback";
import { renderWithMantine } from "~/test-utils";

test("ProfileFormFallback renders loading copy and disabled-looking action", () => {
  const { getByText } = renderWithMantine(<ProfileFormFallback />);

  expect(getByText("プロフィールを読み込み中")).toBeDefined();
  expect(getByText("保存する")).toBeDefined();
});
