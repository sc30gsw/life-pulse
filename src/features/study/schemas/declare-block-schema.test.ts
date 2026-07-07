import * as v from "valibot";
import { expect, test } from "vite-plus/test";

import { DeclareBlockSchema } from "~/features/study/schemas/declare-block-schema";

test("derives a block declaration from a valid same-day range", () => {
  const result = v.safeParse(DeclareBlockSchema, {
    category: "toeic",
    range: ["2099-01-01 06:00:00", "2099-01-01 07:00:00"],
  });

  expect(result.success).toBe(true);
  expect(result.output).toEqual({
    category: "toeic",
    dateJst: "2099-01-01",
    endHm: "07:00",
    startHm: "06:00",
  });
});

test("rejects a range with a missing endpoint", () => {
  const result = v.safeParse(DeclareBlockSchema, {
    category: "toeic",
    range: ["2099-01-01 06:00:00", null],
  });

  expect(result.success).toBe(false);
});

test("rejects a range that crosses a date boundary", () => {
  const result = v.safeParse(DeclareBlockSchema, {
    category: "toeic",
    range: ["2099-01-01 23:30:00", "2099-01-02 00:30:00"],
  });

  expect(result.success).toBe(false);
});

test("rejects an end datetime at or before the start datetime", () => {
  const inverted = v.safeParse(DeclareBlockSchema, {
    category: "toeic",
    range: ["2099-01-01 07:00:00", "2099-01-01 06:00:00"],
  });

  const equal = v.safeParse(DeclareBlockSchema, {
    category: "toeic",
    range: ["2099-01-01 06:00:00", "2099-01-01 06:00:00"],
  });

  expect(inverted.success).toBe(false);
  expect(equal.success).toBe(false);
});

test("rejects a past date", () => {
  const result = v.safeParse(DeclareBlockSchema, {
    category: "toeic",
    range: ["2000-01-01 06:00:00", "2000-01-01 07:00:00"],
  });

  expect(result.success).toBe(false);
});

test("rejects an unknown category", () => {
  const result = v.safeParse(DeclareBlockSchema, {
    category: "piano",
    range: ["2099-01-01 06:00:00", "2099-01-01 07:00:00"],
  });

  expect(result.success).toBe(false);
});
