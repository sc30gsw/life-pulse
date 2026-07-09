import { expect, test } from "vite-plus/test";

import { ACCENT_CLASSES, ACCENT_SOLID_STYLE, ACCENT_VARS } from "~/types/dashboard";

test("keeps accent maps aligned across class, css-var, and solid style tokens", () => {
  expect(Object.keys(ACCENT_CLASSES).sort()).toEqual(Object.keys(ACCENT_VARS).sort());
  expect(Object.keys(ACCENT_SOLID_STYLE).sort()).toEqual(Object.keys(ACCENT_VARS).sort());
  expect(ACCENT_CLASSES.good.text).toBe("text-good");
  expect(ACCENT_VARS.coral).toBe("var(--coral)");
  expect(ACCENT_SOLID_STYLE.blue).toEqual({
    backgroundColor: "var(--blue)",
    color: "var(--bg)",
  });
});
