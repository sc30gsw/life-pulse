import type { FunctionReturnType } from "convex/server";

import type { api } from "~/../convex/_generated/api";
import type { useBoardClock } from "~/features/dashboard/hooks/use-board-clock";

const MINUTE_MS = 60_000;

export function deriveFastingElapsedMinutes(
  fastingStartedAt: NonNullable<
    FunctionReturnType<typeof api.queries.dashboard.fasting.fasting>
  >["startedAt"],
  nowMs: ReturnType<typeof useBoardClock>["nowMs"],
) {
  return Math.max(0, (nowMs - fastingStartedAt) / MINUTE_MS);
}
