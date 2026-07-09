import { expect, test } from "vite-plus/test";

import type { Doc } from "../../_generated/dataModel";
import { mergeByDate } from "./mergeByDate";

function buildRow(overrides: Partial<Doc<"healthMetrics">>): Doc<"healthMetrics"> {
  return {
    _creationTime: 0,
    _id: "health_1",
    dateJst: "2026-07-07",
    source: "manual",
    syncedAt: 0,
    ...overrides,
  } as Doc<"healthMetrics">;
}

test("ignores legacy demo rows and prefers garmin over manual", () => {
  const rows = [
    buildRow({ dateJst: "2026-07-01", source: "manual", steps: 1000 }),
    buildRow({ dateJst: "2026-07-01", source: "garmin", steps: 2000 }),
    buildRow({ dateJst: "2026-07-01", source: "demo", steps: 3000 }),
    buildRow({ dateJst: "2026-07-02", source: "manual", steps: 4000 }),
    buildRow({ dateJst: "2026-07-02", source: "garmin", steps: 5000 }),
  ];

  const merged = mergeByDate(rows);

  expect(merged).toHaveLength(2);
  expect(merged[0]).toMatchObject({ dateJst: "2026-07-01", source: "garmin", steps: 2000 });
  expect(merged[1]).toMatchObject({ dateJst: "2026-07-02", source: "garmin", steps: 5000 });
});

test("falls back to manual when no garmin row exists", () => {
  const rows = [
    buildRow({ dateJst: "2026-07-01", source: "manual", steps: 1000 }),
    buildRow({ dateJst: "2026-07-01", source: "demo", steps: 3000 }),
  ];

  const merged = mergeByDate(rows);

  expect(merged).toHaveLength(1);
  expect(merged[0]).toMatchObject({ dateJst: "2026-07-01", source: "manual", steps: 1000 });
});

test("returns exactly one row per distinct date, sorted ascending by dateJst", () => {
  const rows = [
    buildRow({ dateJst: "2026-07-03" }),
    buildRow({ dateJst: "2026-07-01" }),
    buildRow({ dateJst: "2026-07-02" }),
  ];

  expect(mergeByDate(rows).map((row) => row.dateJst)).toEqual([
    "2026-07-01",
    "2026-07-02",
    "2026-07-03",
  ]);
});

test("preserves the chosen row's original fields", () => {
  const rows = [buildRow({ bodyBattery: 80, hrv: 55, sleepScore: 70 })];

  expect(mergeByDate(rows)[0]).toMatchObject({ bodyBattery: 80, hrv: 55, sleepScore: 70 });
});

test("supports the dashboard.health single-date composition: mergeByDate(rows)[0] ?? null", () => {
  const rows = [
    buildRow({ dateJst: "2026-07-07", source: "manual", steps: 500 }),
    buildRow({ dateJst: "2026-07-07", source: "garmin", steps: 900 }),
  ];

  expect(mergeByDate(rows)[0] ?? null).toMatchObject({ source: "garmin", steps: 900 });
  expect(mergeByDate([])[0] ?? null).toBeNull();
});
