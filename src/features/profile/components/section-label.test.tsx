import { expect, test } from "vite-plus/test";

import { SectionLabel } from "~/features/profile/components/section-label";
import { renderWithMantine } from "~/test-utils";

test("SectionLabel renders the label as a section heading", () => {
  const { getByRole } = renderWithMantine(<SectionLabel label="メールアドレス" />);

  expect(getByRole("heading", { level: 2, name: "メールアドレス" })).toBeDefined();
});
