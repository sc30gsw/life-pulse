import { expect, test } from "vite-plus/test";

import { toDateJst, todayJst } from "~/utils/date-jst";

test("returns the JST calendar date for a midday JST instant", () => {
  const epochMs = Date.UTC(2026, 0, 15, 3, 0, 0);

  expect(toDateJst(epochMs)).toBe("2026-01-15");
});

test("returns the next JST calendar date when UTC has not yet crossed midnight", () => {
  const epochMs = Date.UTC(2026, 0, 1, 15, 0, 0);

  expect(toDateJst(epochMs)).toBe("2026-01-02");
});

test("todayJst returns a YYYY-MM-DD formatted string", () => {
  expect(todayJst()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});
