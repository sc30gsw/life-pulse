import { Badge } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";

import { useDashboardViewer } from "~/features/dashboard/hooks/use-dashboard-viewer";
import { ACCENT_SOLID_STYLE } from "~/types/dashboard";

export function SelfBadge() {
  const viewer = useDashboardViewer();

  if (viewer.role !== "self") {
    return null;
  }

  return (
    <Badge variant="filled" style={ACCENT_SOLID_STYLE.good} size="xs">
      YOU
    </Badge>
  );
}

export function SelfBadgeFallback() {
  return (
    <Shimmer loading>
      <Badge variant="filled" style={ACCENT_SOLID_STYLE.good} size="xs">
        YOU
      </Badge>
    </Shimmer>
  );
}
