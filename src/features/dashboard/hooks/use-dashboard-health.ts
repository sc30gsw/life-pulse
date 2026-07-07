import { useSuspenseQuery } from "@tanstack/react-query";

import { dashboardHealthQuery } from "~/features/dashboard/api/dashboard-health-query";
import { useBoardClock } from "~/features/dashboard/hooks/use-board-clock";
import { formatRelativeTime } from "~/features/dashboard/utils/format";

export function useDashboardHealth() {
  const { dateJst, nowMs } = useBoardClock();
  const metrics = useSuspenseQuery(dashboardHealthQuery(dateJst)).data;

  return {
    lastSyncRelativeLabel:
      metrics === null ? "未同期" : formatRelativeTime(metrics.syncedAt, nowMs),
    metrics,
  } as const;
}
