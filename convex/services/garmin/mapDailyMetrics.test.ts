import { expect, test } from "vite-plus/test";

import { mapDailyMetrics, type RawGarminDailyMetrics } from "./mapDailyMetrics";

function buildRaw(overrides: Partial<RawGarminDailyMetrics>): RawGarminDailyMetrics {
  return {
    dailySleep: {},
    bodyBattery: {},
    hrvStatus: {},
    heartRate: {},
    ...overrides,
  };
}

test("all fields present: maps every field, taking the day's max Body Battery across multiple points", () => {
  const raw = buildRaw({
    dailySleep: {
      dailySleepDTO: {
        sleepTimeSeconds: 25_200, // 7h -> 420min
        sleepScores: { overall: { value: 82 } },
      },
    },
    bodyBattery: [
      {
        bodyBatteryValuesArray: [
          [1000, 40],
          [2000, 55],
        ],
      },
      {
        bodyBatteryValuesArray: [
          [3000, 95],
          [4000, 30],
        ],
      },
    ],
    hrvStatus: { hrvSummary: { lastNightAvg: 62, weeklyAvg: 58 } },
    heartRate: { restingHeartRate: 54 },
  });

  expect(mapDailyMetrics(raw, "2026-07-08")).toEqual({
    dateJst: "2026-07-08",
    sleepScore: 82,
    sleepMinutes: 420,
    bodyBattery: 95,
    hrv: 62,
    restingHr: 54,
    steps: undefined,
  });
});

test("partial data: missing sleepScores/hrv/restingHr map to undefined; single (non-array) Body Battery point still yields its max, ignoring null readings", () => {
  const raw = buildRaw({
    dailySleep: {
      dailySleepDTO: { sleepTimeSeconds: 27_000 }, // 7.5h -> 450min, no sleepScores
    },
    bodyBattery: {
      bodyBatteryValuesArray: [
        [1000, 20],
        [2000, null],
        [3000, 65],
      ],
    },
    hrvStatus: { hrvSummary: { weeklyAvg: 58 } }, // no lastNightAvg
    heartRate: {}, // no restingHeartRate
  });

  expect(mapDailyMetrics(raw, "2026-07-08")).toEqual({
    dateJst: "2026-07-08",
    sleepScore: undefined,
    sleepMinutes: 450,
    bodyBattery: 65,
    hrv: undefined,
    restingHr: undefined,
    steps: undefined,
  });
});

test("empty/minimal raw response: every optional field maps to undefined, never null or 0", () => {
  const raw = buildRaw({});

  expect(mapDailyMetrics(raw, "2026-07-08")).toEqual({
    dateJst: "2026-07-08",
    sleepScore: undefined,
    sleepMinutes: undefined,
    bodyBattery: undefined,
    hrv: undefined,
    restingHr: undefined,
    steps: undefined,
  });
});

test("Body Battery with only null readings across all points maps to undefined, not 0 or NaN", () => {
  const raw = buildRaw({
    bodyBattery: [{ bodyBatteryValuesArray: [[1000, null]] }, { bodyBatteryValuesArray: [] }],
  });

  expect(mapDailyMetrics(raw, "2026-07-08").bodyBattery).toBeUndefined();
});
