// @vitest-environment happy-dom
import { expect, test } from "vite-plus/test";

import {
  MissingViewerEmptyState,
  ProfileFormFallback,
} from "~/features/profile/components/profile-states";
import { renderWithMantine } from "~/test-utils";

test("MissingViewerEmptyState renders missing profile copy", () => {
  const { getByText } = renderWithMantine(<MissingViewerEmptyState />);

  expect(getByText("プロフィール未作成")).toBeDefined();
});

test("ProfileFormFallback renders loading copy", () => {
  const { getByText } = renderWithMantine(<ProfileFormFallback />);

  expect(getByText("プロフィールを読み込み中")).toBeDefined();
});
