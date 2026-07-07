import { expect, test } from "vite-plus/test";

import { holidayName } from "~/utils/holiday";

test("returns a Japanese holiday name for a known holiday", () => {
  expect(holidayName("2026-01-01")).toBe("元日");
});

test("returns null for a non-holiday weekday", () => {
  expect(holidayName("2026-01-06")).toBeNull();
});
