import { useSuspenseQuery } from "@tanstack/react-query";

import { dashboardViewerQuery } from "~/features/dashboard/api/dashboard-viewer-query";

export function useDashboardViewer() {
  return useSuspenseQuery(dashboardViewerQuery()).data;
}
