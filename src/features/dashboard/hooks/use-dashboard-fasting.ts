import { useSuspenseQuery } from "@tanstack/react-query";

import { dashboardFastingQuery } from "~/features/dashboard/api/dashboard-fasting-query";
import { useBoardClock } from "~/features/dashboard/hooks/use-board-clock";
import { formatElapsedClock, formatMinutesAsHm } from "~/features/dashboard/utils/format";
import { deriveFastingElapsedMinutes } from "~/features/fasting/utils/fasting-utils";

const DEFAULT_FASTING_TARGET_MINUTES = 960;

export function useDashboardFasting() {
  const { nowMs } = useBoardClock();
  const fasting = useSuspenseQuery(dashboardFastingQuery()).data;
  const fastingTargetMinutes = fasting?.targetMinutes ?? DEFAULT_FASTING_TARGET_MINUTES;
  const fastingElapsedMinutes =
    fasting === null ? 0 : deriveFastingElapsedMinutes(fasting.startedAt, nowMs);

  return {
    fasting,
    fastingElapsedLabel: formatElapsedClock(fastingElapsedMinutes * 60_000),
    fastingRemainLabel: formatMinutesAsHm(
      Math.max(0, fastingTargetMinutes - fastingElapsedMinutes),
    ),
    fastingRingPercent: Math.min(
      100,
      Math.round((fastingElapsedMinutes / fastingTargetMinutes) * 100),
    ),
  } as const;
}
