import type { Doc } from "../../_generated/dataModel";

// Local mirror of the fields this mapper reads off `GarminRawDailyMetrics`
// (convex/actions/garmin/client.ts). Deliberately NOT imported from there:
// this file must stay free of the "garmin-connect-sdk" dependency so it's a
// plain pure function (CVX-09), testable with no convex-test / "use node"
// runtime. `dailySleepDTO.sleepTimeSeconds` and `bodyBatteryValuesArray` are
// part of the SDK's typed zod schema; `sleepScores`, `hrvSummary`'s contents,
// and `restingHeartRate` are NOT — Garmin's real payloads include them, but
// the SDK only types them via `.passthrough()` (raw JSON, `unknown` shape), so
// they're read defensively below instead of assumed to have a fixed shape.
type RawDailySleep = Partial<
  Record<
    "dailySleepDTO",
    {
      sleepTimeSeconds?: number | null;
      sleepScores?: unknown; // real shape: { overall?: { value?: number } }
    }
  >
>;

type RawBodyBatteryPoint = Partial<Record<"bodyBatteryValuesArray", [number, number | null][]>>;
type RawHrvStatus = Partial<Record<"hrvSummary", unknown>>;
type RawHeartRate = Partial<Record<"restingHeartRate", number | undefined>>;
// One day's entry from the patched range endpoint
// `/usersummary-service/stats/steps/daily/{start}/{end}` (see client.ts's
// NOTE): the calling action picks THIS day's entry out of the range response
// before mapping, so a day Garmin returned nothing for stays `undefined`.
type RawDailySteps = Partial<Record<"totalSteps", number | null>>;

export type RawGarminDailyMetrics = {
  dailySleep: RawDailySleep;
  bodyBattery: RawBodyBatteryPoint | RawBodyBatteryPoint[];
  hrvStatus: RawHrvStatus;
  heartRate: RawHeartRate;
  dailySteps?: RawDailySteps;
};

export type MappedHealthMetrics = Pick<
  Doc<"healthMetrics">,
  "bodyBattery" | "dateJst" | "hrv" | "restingHr" | "sleepMinutes" | "sleepScore" | "steps"
>;

// Pure function (CVX-09): raw Garmin payloads -> healthMetrics fields for one
// day. A field Garmin didn't return maps to `undefined` (never null/0), so
// the merge-patch in mutations/health/upsertFromSync.ts (plan Step 5) leaves
// an existing manual value alone for anything Garmin stayed silent on.
// `steps` comes from the patched range endpoint's per-day entry (`dailySteps`,
// optional — see client.ts's NOTE); `null`/missing maps to `undefined`.
export function mapDailyMetrics(
  raw: RawGarminDailyMetrics,
  dateJst: Doc<"healthMetrics">["dateJst"],
): MappedHealthMetrics {
  return {
    dateJst,
    sleepScore: readSleepScore(raw.dailySleep.dailySleepDTO?.sleepScores),
    sleepMinutes: secondsToMinutes(raw.dailySleep.dailySleepDTO?.sleepTimeSeconds),
    bodyBattery: maxBodyBattery(raw.bodyBattery),
    hrv: readLastNightAvgHrv(raw.hrvStatus.hrvSummary),
    restingHr: readNumber(raw.heartRate.restingHeartRate),
    steps: readNumber(raw.dailySteps?.totalSteps),
  };
}

function secondsToMinutes(
  seconds: number | null | undefined,
): Doc<"healthMetrics">["sleepMinutes"] {
  return seconds == null ? undefined : Math.round(seconds / 60);
}

// Body Battery representative value is the day's MAXIMUM reading (plan §0-4):
// a single rule that covers both the previous day (settled, near its own max
// well before the 6:30 JST sync) and the current day (whose max at 6:30 JST
// is effectively the overnight-charged wake-up value). `bodyBattery` from the
// SDK is `BodyBatteryPoint | BodyBatteryPoint[]` (getBodyBattery with a single
// date can resolve to either shape per the SDK's zod `.or()` union) — each
// point's `bodyBatteryValuesArray` is a list of `[timestampMs, value | null]`
// tuples, so every point is flattened and nulls are dropped before taking the
// max.
function maxBodyBattery(
  bodyBattery: RawBodyBatteryPoint | RawBodyBatteryPoint[],
): Doc<"healthMetrics">["bodyBattery"] {
  const points = Array.isArray(bodyBattery) ? bodyBattery : [bodyBattery];

  let max: Doc<"healthMetrics">["bodyBattery"];
  for (const point of points) {
    for (const [, value] of point.bodyBatteryValuesArray ?? []) {
      if (value !== null && (max === undefined || value > max)) {
        max = value;
      }
    }
  }

  return max;
}

// Real Garmin dailySleepData responses nest the score at
// `dailySleepDTO.sleepScores.overall.value`, but the SDK's zod schema only
// types the numeric duration fields on `dailySleepDTO` — `sleepScores` comes
// through as an untyped passthrough value, so it's narrowed defensively here.
function readSleepScore(sleepScores: unknown) {
  if (typeof sleepScores !== "object" || sleepScores === null) {
    return undefined;
  }

  const overall = (sleepScores as Record<string, unknown>).overall;
  if (typeof overall !== "object" || overall === null) {
    return undefined;
  }

  return readNumber((overall as Record<string, unknown>).value);
}

// Real Garmin HRV status responses nest a "last night average" HRV reading at
// `hrvSummary.lastNightAvg`, but the SDK's zod schema types `hrvSummary` only
// as an untyped record, so it's narrowed defensively here.
function readLastNightAvgHrv(hrvSummary: unknown) {
  if (typeof hrvSummary !== "object" || hrvSummary === null) {
    return undefined;
  }

  return readNumber((hrvSummary as Record<string, unknown>).lastNightAvg);
}

function readNumber(value: unknown) {
  return typeof value === "number" ? value : undefined;
}
