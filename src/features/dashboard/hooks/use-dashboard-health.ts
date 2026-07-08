import { useSuspenseQuery } from "@tanstack/react-query";

import { dashboardHealthQuery } from "~/features/dashboard/api/dashboard-health-query";
import { DASHBOARD_HEALTH_COPY } from "~/features/dashboard/constants/health-metrics";
import { useBoardClock } from "~/features/dashboard/hooks/use-board-clock";
import { formatRelativeTime } from "~/features/dashboard/utils/format";

export function useDashboardHealth() {
  const { dateJst, nowMs } = useBoardClock();
  const metrics = useSuspenseQuery(dashboardHealthQuery(dateJst)).data;

  return {
    dateJst,
    lastSyncRelativeLabel:
      metrics === null
        ? DASHBOARD_HEALTH_COPY.status.noSync
        : formatRelativeTime(metrics.syncedAt, nowMs),
    metrics,
  } as const;
}
