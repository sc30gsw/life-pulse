import { notifications } from "@mantine/notifications";
import { useSuspenseQuery } from "@tanstack/react-query";

import { dashboardPresenceQuery } from "~/features/dashboard/api/dashboard-presence-query";
import { useBoardClock } from "~/features/dashboard/hooks/use-board-clock";
import { useSetPresence } from "~/features/dashboard/hooks/use-set-presence";
import { type PresenceState } from "~/features/dashboard/types/dashboard";
import { formatRelativeTime } from "~/features/dashboard/utils/format";

export function useDashboardPresence() {
  const { nowMs } = useBoardClock();
  const partner = useSuspenseQuery(dashboardPresenceQuery()).data;
  const setPresence = useSetPresence();

  function onSetPresence(state: PresenceState, etaHm?: string) {
    setPresence.mutate(
      { etaHm, state },
      {
        onError: () => {
          notifications.show({ color: "red", message: "更新に失敗しました", title: "エラー" });
        },
        onSuccess: () => {
          notifications.show({
            color: "blue",
            message: `パートナー: ${state}`,
            title: "更新しました",
          });
        },
      },
    );
  }

  return {
    onSetPresence,
    partner,
    // Flash-on-remote-update (server push detection) is deferred past W1 — see the wiring plan.
    partnerFlash: false,
    partnerUpdatedRelativeLabel:
      partner === null ? "未更新" : formatRelativeTime(partner.updatedAt, nowMs),
  } as const;
}
