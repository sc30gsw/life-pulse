import * as v from "valibot";
import { expect, test } from "vite-plus/test";

import { DeclareBlockSchema } from "~/features/study/schemas/declare-block-schema";

test("accepts a valid declaration", () => {
  const result = v.safeParse(DeclareBlockSchema, {
    category: "toeic",
    endHm: "07:00",
    startHm: "06:00",
  });

  expect(result.success).toBe(true);
});

test("rejects a malformed time", () => {
  const result = v.safeParse(DeclareBlockSchema, {
    category: "toeic",
    endHm: "7pm",
    startHm: "06:00",
  });

  expect(result.success).toBe(false);
});

test("rejects an end time at or before the start time", () => {
  const inverted = v.safeParse(DeclareBlockSchema, {
    category: "toeic",
    endHm: "06:00",
    startHm: "07:00",
  });
  const equal = v.safeParse(DeclareBlockSchema, {
    category: "toeic",
    endHm: "06:00",
    startHm: "06:00",
  });

  expect(inverted.success).toBe(false);
  expect(equal.success).toBe(false);
});

test("rejects an unknown category", () => {
  const result = v.safeParse(DeclareBlockSchema, {
    category: "piano",
    endHm: "07:00",
    startHm: "06:00",
  });

  expect(result.success).toBe(false);
});
