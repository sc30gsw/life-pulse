import { expect, test } from "vite-plus/test";

import { pearson } from "./pearson";

test("returns 1 for a perfect positive linear relationship", () => {
  const pairs: ReadonlyArray<readonly [number, number]> = [
    [1, 2],
    [2, 4],
    [3, 6],
  ];

  expect(pearson(pairs)).toBe(1);
});

test("returns -1 for a perfect negative linear relationship", () => {
  const pairs: ReadonlyArray<readonly [number, number]> = [
    [1, 6],
    [2, 4],
    [3, 2],
  ];

  expect(pearson(pairs)).toBe(-1);
});

test("returns 0 when x and y are uncorrelated", () => {
  const pairs: ReadonlyArray<readonly [number, number]> = [
    [1, 2],
    [2, 3],
    [3, 2],
  ];

  expect(pearson(pairs)).toBe(0);
});

test("returns null when there are fewer than 2 pairs", () => {
  expect(pearson([])).toBeNull();
  expect(pearson([[1, 2]])).toBeNull();
});

test("returns null when x has zero variance", () => {
  const pairs: ReadonlyArray<readonly [number, number]> = [
    [5, 1],
    [5, 2],
    [5, 3],
  ];

  expect(pearson(pairs)).toBeNull();
});

test("returns null when y has zero variance", () => {
  const pairs: ReadonlyArray<readonly [number, number]> = [
    [1, 5],
    [2, 5],
    [3, 5],
  ];

  expect(pearson(pairs)).toBeNull();
});
