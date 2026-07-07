import { expect, test } from "vite-plus/test";

import { deriveFastingElapsedMinutes } from "~/features/fasting/utils/fasting-utils";

test("deriveFastingElapsedMinutes derives elapsed minutes from start to now", () => {
  expect(deriveFastingElapsedMinutes(0, 5 * 60_000)).toBe(5);
});

test("deriveFastingElapsedMinutes clamps a negative delta to 0", () => {
  expect(deriveFastingElapsedMinutes(10_000, 5_000)).toBe(0);
});
