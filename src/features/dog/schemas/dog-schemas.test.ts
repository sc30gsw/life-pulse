import * as v from "valibot";
import { expect, test } from "vite-plus/test";

import { DogNameSchema } from "~/features/dog/schemas/dog-name-schema";
import { DogTaskNameSchema } from "~/features/dog/schemas/dog-task-name-schema";

test("DogNameSchema trims and accepts a non-empty name", () => {
  expect(v.parse(DogNameSchema, { name: " ハマロ " })).toEqual({ name: "ハマロ" });
});

test("DogNameSchema rejects a whitespace-only name", () => {
  expect(() => v.parse(DogNameSchema, { name: "   " })).toThrow("名前を入力してください");
});

test("DogTaskNameSchema trims and accepts a non-empty task name", () => {
  expect(v.parse(DogTaskNameSchema, { name: " 朝散歩 " })).toEqual({ name: "朝散歩" });
});

test("DogTaskNameSchema rejects a whitespace-only task name", () => {
  expect(() => v.parse(DogTaskNameSchema, { name: "   " })).toThrow("タスク名を入力してください");
});
