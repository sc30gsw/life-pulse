import { expect, test } from "vite-plus/test";

import { addDaysJst, todayJst } from "./date-range";

test("todayJst returns a YYYY-MM-DD formatted string", () => {
  expect(todayJst()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});

test("addDaysJst crosses a month boundary", () => {
  expect(addDaysJst("2026-01-31", 1)).toBe("2026-02-01");
});

test("addDaysJst crosses a year boundary", () => {
  expect(addDaysJst("2026-12-31", 1)).toBe("2027-01-01");
});
