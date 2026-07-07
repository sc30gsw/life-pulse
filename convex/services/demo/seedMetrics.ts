import type { WithoutSystemFields } from "convex/server";

import type { Doc } from "../../_generated/dataModel";
import { addDaysJst } from "../../lib/dateRange";
import { type DemoMetricFields, nextDemoMetric } from "./nextDemoMetric";

type SeedRow = Omit<WithoutSystemFields<Doc<"healthMetrics">>, "syncedAt">;

// Builds days + 1 rows (todayJst - days .. todayJst inclusive) by walking
// nextDemoMetric forward one day at a time. Pure function (CVX-09) — `rand`
// is injected so the same sequence reproduces the same seed deterministically.
// syncedAt is deliberately omitted: it is a "now" value stamped by the
// calling (impure) mutation, not describable purely from date + source.
export function seedMetrics(
  todayJst: Doc<"healthMetrics">["dateJst"],
  days: number,
  rand: () => number,
): SeedRow[] {
  const startDateJst = addDaysJst(todayJst, -days);
  const rows: SeedRow[] = [];
  let prevMetrics: DemoMetricFields | undefined;

  for (let offset = 0; offset <= days; offset += 1) {
    const metrics = nextDemoMetric(prevMetrics, rand);

    rows.push({ dateJst: addDaysJst(startDateJst, offset), source: "demo", ...metrics });
    prevMetrics = metrics;
  }

  return rows;
}
