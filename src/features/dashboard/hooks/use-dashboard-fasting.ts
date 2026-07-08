import { useSuspenseQuery } from "@tanstack/react-query";

import { dashboardFastingQuery } from "~/features/dashboard/api/dashboard-fasting-query";
import { useBoardClock } from "~/features/dashboard/hooks/use-board-clock";
import { useRemoteUpdateFlash } from "~/features/dashboard/hooks/use-remote-update-flash";
import { formatElapsedClock } from "~/features/dashboard/utils/format";
import { DEFAULT_FASTING_TARGET_MINUTES } from "~/features/fasting/constants/fasting-target";
import { deriveFastingElapsedMinutes } from "~/features/fasting/utils/fasting-utils";

export function useDashboardFasting() {
  const { nowMs } = useBoardClock();
  const fasting = useSuspenseQuery(dashboardFastingQuery()).data;
  const fastingTargetMinutes = fasting?.targetMinutes ?? DEFAULT_FASTING_TARGET_MINUTES;
  const fastingElapsedMinutes =
    fasting === null ? 0 : deriveFastingElapsedMinutes(fasting.startedAt, nowMs);
  const fastingFingerprint =
    fasting === null
      ? "none"
      : [
          fasting._id,
          fasting.status,
          fasting.phase,
          fasting.startedAt,
          fasting.endedAt ?? "",
          fasting.actualMinutes ?? "",
          fasting.targetMinutes,
        ].join("|");
  const { flashRef: fastingFlashRef, suppressNextFlash: suppressNextFastingFlash } =
    useRemoteUpdateFlash(fastingFingerprint);

  return {
    fasting,
    fastingElapsedLabel: formatElapsedClock(fastingElapsedMinutes * 60_000),
    fastingFlashRef,
    fastingRemainLabel: formatElapsedClock(
      Math.max(0, fastingTargetMinutes - fastingElapsedMinutes) * 60_000,
    ),
    fastingRingPercent: Math.min(
      100,
      Math.round((fastingElapsedMinutes / fastingTargetMinutes) * 100),
    ),
    suppressNextFastingFlash,
  } as const;
}
