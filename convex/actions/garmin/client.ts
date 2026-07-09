"use node";

// Isolation layer for `garmin-connect-sdk@1.0.0-alpha.4` (CVX-06 / plan §2 Step 3).
// This is the ONLY file in convex/ allowed to import "garmin-connect-sdk" — every
// other Garmin-related file (mapper, mutations, action, UI) talks to `GarminClient`
// only. If the alpha SDK's response shapes drift or it needs replacing with the
// `@gooin/garmin-connect@1.8.7` fallback (plan §4 risk table), only this file changes.
//
// "use node" is required even though nothing here calls Node APIs directly: the
// SDK's bundle statically imports `node:fs/promises` and `node:path` for its
// (unused, here) FileTokenStorage class, so the whole module requires the Node.js
// runtime to load at all (see node_modules/garmin-connect-sdk/dist/index.js:1525-1534).
import { Result } from "better-result";
import {
  type BodyBattery,
  type DailySleep,
  GarminConnectSDK,
  type GarminTokens,
  type HeartRate,
  type HrvStatus,
  type TokenStorage,
} from "garmin-connect-sdk";

import type { DateJst } from "../../lib/dateRange";

// Raw per-day responses from the four Garmin Connect read endpoints this app needs.
// Deliberately untransformed — convex/services/garmin/mapDailyMetrics.ts (plan Step 4)
// owns turning this into { dateJst, sleepScore?, sleepMinutes?, bodyBattery?, hrv?,
// restingHr?, steps? }, including reaching into the SDK's zod "passthrough" fields
// (e.g. sleep score, resting HR) that exist in Garmin's real payloads but aren't part
// of this alpha SDK's typed schema.
//
// NOTE: `steps` is NOT part of this per-day shape. The upstream SDK exposes no
// step-count endpoint, so our pnpm patch (patches/garmin-connect-sdk.patch) adds
// `HealthEndpoint.getDailySteps(start, end)` backed by Garmin's range endpoint
// `/usersummary-service/stats/steps/daily/{start}/{end}` — one request returns
// every day in the range, so steps are fetched once per sync via
// `fetchDailySteps` below rather than per-day here.
export type GarminRawDailyMetrics = {
  dailySleep: DailySleep;
  bodyBattery: BodyBattery;
  hrvStatus: HrvStatus;
  heartRate: HeartRate;
};

// One entry per day from the patched `getDailySteps` range endpoint.
export type GarminRawDailyStepsEntry = Awaited<
  ReturnType<GarminConnectSDK["health"]["getDailySteps"]>
>[number];

// Thin abstraction the rest of convex/ codes against instead of the SDK directly.
export type GarminClient = {
  fetchDailyMetrics(dateJst: DateJst): Promise<GarminRawDailyMetrics>;
  fetchDailySteps(startJst: DateJst, endJst: DateJst): Promise<GarminRawDailyStepsEntry[]>;
};

// Restores a session from a token JSON the user produced once via
// `scripts/garmin-login.ts` and set with `npx convex env set GARMIN_TOKENS_JSON`
// (plan §0-1). Convex environment variables cannot be rewritten by a running
// function, so a token refreshed mid-run is kept in memory for the rest of THIS
// action invocation only (`save`) and is never written back anywhere (`clear` is a
// no-op for the same reason). When the refresh token itself eventually expires,
// the fix is re-running scripts/garmin-login.ts and resetting the env var — there
// is no automatic recovery path here by design.
//
// A plain closure (not a class, per CVX-09) satisfies the SDK's structural
// `TokenStorage` shape just as well as a class instance would.
function createEnvTokenStorage(): TokenStorage {
  let tokens = parseGarminTokensEnv();

  return {
    async load(): Promise<GarminTokens | null> {
      return { ...tokens };
    },
    async save(next: GarminTokens): Promise<void> {
      tokens = { ...next };
    },
    async clear(): Promise<void> {
      // No-op: nothing persisted at runtime to clear (see doc comment above).
    },
  };
}

function parseGarminTokensEnv(): GarminTokens {
  const raw = process.env.GARMIN_TOKENS_JSON;

  if (!raw) {
    throw new Error(
      "GARMIN_TOKENS_JSON is not set. Run `node scripts/garmin-login.ts` and " +
        "`npx convex env set GARMIN_TOKENS_JSON '<printed JSON>'` to configure Garmin sync.",
    );
  }

  const parsedResult = Result.try({
    catch: (cause) =>
      new Error(
        "GARMIN_TOKENS_JSON is not valid JSON. Re-run scripts/garmin-login.ts and reset it with " +
          "`npx convex env set GARMIN_TOKENS_JSON`.",
        { cause },
      ),
    try: () => JSON.parse(raw) as unknown,
  });

  if (Result.isError(parsedResult)) {
    throw parsedResult.error;
  }

  const parsed = parsedResult.value;

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).accessToken !== "string" ||
    typeof (parsed as Record<string, unknown>).refreshToken !== "string" ||
    typeof (parsed as Record<string, unknown>).accessTokenExpiresAt !== "string"
  ) {
    throw new Error(
      "GARMIN_TOKENS_JSON is missing accessToken/refreshToken/accessTokenExpiresAt. " +
        "Re-run scripts/garmin-login.ts and reset it with `npx convex env set GARMIN_TOKENS_JSON`.",
    );
  }

  return parsed as GarminTokens;
}

// Builds a `GarminClient` backed by a real `GarminConnectSDK` instance. Call this
// once per action invocation (convex/actions/garmin/syncDaily.ts, plan Step 6) —
// constructing it parses+validates GARMIN_TOKENS_JSON immediately (fail fast).
export function createGarminClient(): GarminClient {
  const sdk = new GarminConnectSDK({ storage: createEnvTokenStorage() });

  // `restoreSession` resumes the token stored above; it self-refreshes via
  // the SDK's AuthService when the access token is near expiry (see
  // node_modules/garmin-connect-sdk/dist/index.js:220-226, 300-312) and
  // throws GarminSessionExpiredError if the refresh token itself is dead.
  // Cheap when the token is still valid, so calling it per fetch is fine.
  const restoreSession = async () => {
    const restored = await sdk.restoreSession();
    if (!restored) {
      throw new Error("Garmin session could not be restored from GARMIN_TOKENS_JSON.");
    }
  };

  return {
    async fetchDailyMetrics(dateJst) {
      await restoreSession();

      const [dailySleep, bodyBattery, hrvStatus, heartRate] = await Promise.all([
        // SleepEndpoint.getDailySleep — dist/index.d.ts:2838
        sdk.sleep.getDailySleep(dateJst),
        // HealthEndpoint.getBodyBattery — dist/index.d.ts:2573 (single date, not a
        // range: plan §0-4 takes the day's max value from this one day's series)
        sdk.health.getBodyBattery(dateJst),
        // HealthEndpoint.getHrvStatus — dist/index.d.ts:2574
        sdk.health.getHrvStatus(dateJst),
        // HealthEndpoint.getHeartRate — dist/index.d.ts:2571
        sdk.health.getHeartRate(dateJst),
      ]);

      return { dailySleep, bodyBattery, hrvStatus, heartRate };
    },

    async fetchDailySteps(startJst, endJst) {
      await restoreSession();

      // Patched HealthEndpoint.getDailySteps (patches/garmin-connect-sdk.patch):
      // one request covers the whole [startJst, endJst] range, one entry per day.
      return sdk.health.getDailySteps(startJst, endJst);
    },
  };
}
