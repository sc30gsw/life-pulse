import * as v from "valibot";
import { expect, test } from "vite-plus/test";

import { UpsertManualSchema } from "~/features/health/schemas/upsert-manual-schema";
import { todayJst } from "~/utils/date-jst";

test("accepts a past date with a subset of optional metrics", () => {
  const result = v.safeParse(UpsertManualSchema, {
    bodyBattery: undefined,
    dateJst: "2020-01-01",
    hrv: undefined,
    restingHr: undefined,
    sleepMinutes: 420,
    sleepScore: 80,
    steps: undefined,
  });

  expect(result.success).toBe(true);
});

test("accepts today's date", () => {
  const result = v.safeParse(UpsertManualSchema, { dateJst: todayJst() });

  expect(result.success).toBe(true);
});

test("rejects a future date", () => {
  const result = v.safeParse(UpsertManualSchema, { dateJst: "2999-01-01" });

  expect(result.success).toBe(false);
});

test("rejects a malformed date", () => {
  const result = v.safeParse(UpsertManualSchema, { dateJst: "2026/07/08" });

  expect(result.success).toBe(false);
});
