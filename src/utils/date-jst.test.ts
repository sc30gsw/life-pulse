import { expect, test } from "vite-plus/test";

import { pastDateJstRange, toDateJst, todayJst } from "~/utils/date-jst";

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

test("pastDateJstRange returns the 7 days ending yesterday by default range", () => {
  expect(pastDateJstRange("2026-07-07", 7)).toEqual({
    fromDateJst: "2026-06-30",
    toDateJst: "2026-07-06",
  });
});

test("pastDateJstRange crosses a month boundary", () => {
  expect(pastDateJstRange("2026-07-03", 7)).toEqual({
    fromDateJst: "2026-06-26",
    toDateJst: "2026-07-02",
  });
});

test("pastDateJstRange crosses a year boundary", () => {
  expect(pastDateJstRange("2026-01-02", 7)).toEqual({
    fromDateJst: "2025-12-26",
    toDateJst: "2026-01-01",
  });
});
