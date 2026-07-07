import { expect, test } from "vite-plus/test";

import {
  deriveFastingElapsedMinutes,
  hhmmToMinutes,
  minutesToHhmm,
} from "~/features/fasting/utils/fasting-utils";

test("deriveFastingElapsedMinutes derives elapsed minutes from start to now", () => {
  expect(deriveFastingElapsedMinutes(0, 5 * 60_000)).toBe(5);
});

test("deriveFastingElapsedMinutes clamps a negative delta to 0", () => {
  expect(deriveFastingElapsedMinutes(10_000, 5_000)).toBe(0);
});

test("minutesToHhmm formats minutes as zero-padded hh:mm", () => {
  expect(minutesToHhmm(90)).toBe("01:30");
  expect(minutesToHhmm(960)).toBe("16:00");
});

test("minutesToHhmm returns an empty string for undefined", () => {
  expect(minutesToHhmm(undefined)).toBe("");
});

test("hhmmToMinutes parses hh:mm into total minutes", () => {
  expect(hhmmToMinutes("01:30")).toBe(90);
  expect(hhmmToMinutes("16:00")).toBe(960);
  expect(hhmmToMinutes("36:00")).toBe(2160);
});

test("hhmmToMinutes returns undefined for an incomplete or empty value", () => {
  expect(hhmmToMinutes("")).toBeUndefined();
  expect(hhmmToMinutes("01")).toBeUndefined();
  expect(hhmmToMinutes("01:")).toBeUndefined();
});
