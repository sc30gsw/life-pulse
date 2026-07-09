import { expect, test } from "vite-plus/test";

import {
  formatCorrelation,
  isCorrelationInsufficient,
} from "~/features/insights/utils/format-correlation";

test("formatCorrelation shows データ不足 when n is below MIN_CORRELATION_N", () => {
  expect(formatCorrelation(0.8, 5)).toBe("データ不足(n=5)");
});

test("formatCorrelation shows データ不足 when r is null even with a large n", () => {
  expect(formatCorrelation(null, 23)).toBe("データ不足(n=23)");
});

test("formatCorrelation formats r to 2 decimal places when n meets the threshold", () => {
  expect(formatCorrelation(0.4231, 23)).toBe("r=0.42(n=23)");
});

test("formatCorrelation formats a negative r to 2 decimal places", () => {
  expect(formatCorrelation(-0.999, 10)).toBe("r=-1.00(n=10)");
});

test("isCorrelationInsufficient is true below the threshold", () => {
  expect(isCorrelationInsufficient(0.5, 9)).toBe(true);
});

test("isCorrelationInsufficient is false at exactly the threshold with a non-null r", () => {
  expect(isCorrelationInsufficient(0.5, 10)).toBe(false);
});
