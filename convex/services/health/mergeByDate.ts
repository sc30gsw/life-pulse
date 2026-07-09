import { groupBy, sortBy } from "remeda";

import type { Doc } from "../../_generated/dataModel";

// Display-priority rule: ignore legacy demo rows, then prefer Garmin over
// manual for each date.
// Pure function (CVX-09) — reused by queries/health/range.ts (many dates) and
// services/dashboard/health.ts (single date, via mergeByDate(rows)[0] ?? null).
export function mergeByDate(rows: Doc<"healthMetrics">[]) {
  const candidates = rows.filter((row) => row.source !== "demo");
  const grouped = groupBy(candidates, (row) => row.dateJst);
  const merged = Object.values(grouped).map((dateRows) => pickBySourcePriority(dateRows));

  return sortBy(merged, (row) => row.dateJst);
}

function pickBySourcePriority(dateRows: Doc<"healthMetrics">[]) {
  return dateRows.reduce((best, row) =>
    sourcePriority(row.source) < sourcePriority(best.source) ? row : best,
  );
}

function sourcePriority(source: Doc<"healthMetrics">["source"]) {
  if (source === "garmin") {
    return 0;
  }

  return 1; // manual
}
