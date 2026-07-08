import { groupBy, sortBy } from "remeda";

import type { Doc } from "../../_generated/dataModel";

// Display-priority rule: when demoMode is on, prefer a "demo" row for a date
// if one exists, else "garmin", else "manual". When demoMode is off, "demo"
// rows are excluded (defensively — they should already be deleted once demo
// mode turns off), then "garmin" is preferred over "manual".
// Pure function (CVX-09) — reused by queries/health/range.ts (many dates) and
// services/dashboard/health.ts (single date, via mergeByDate(rows, demoMode)[0] ?? null).
export function mergeByDate(rows: Doc<"healthMetrics">[], demoMode: Doc<"appSettings">["demoMode"]) {
  const candidates = demoMode ? rows : rows.filter((row) => row.source !== "demo");
  const grouped = groupBy(candidates, (row) => row.dateJst);
  const merged = Object.values(grouped).map((dateRows) => pickBySourcePriority(dateRows, demoMode));

  return sortBy(merged, (row) => row.dateJst);
}

function pickBySourcePriority(
  dateRows: Doc<"healthMetrics">[],
  demoMode: Doc<"appSettings">["demoMode"],
) {
  return dateRows.reduce((best, row) =>
    sourcePriority(row.source, demoMode) < sourcePriority(best.source, demoMode) ? row : best,
  );
}

function sourcePriority(
  source: Doc<"healthMetrics">["source"],
  demoMode: Doc<"appSettings">["demoMode"],
) {
  if (source === "demo") {
    return demoMode ? 0 : 2;
  }

  if (source === "garmin") {
    return demoMode ? 1 : 0;
  }

  return demoMode ? 2 : 1; // manual
}
