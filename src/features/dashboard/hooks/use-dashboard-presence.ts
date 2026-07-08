import { notifications } from "@mantine/notifications";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { FunctionArgs } from "convex/server";

import { dashboardPresenceQuery } from "~/features/dashboard/api/dashboard-presence-query";
import { useBoardClock } from "~/features/dashboard/hooks/use-board-clock";
import { useRemoteUpdateFlash } from "~/features/dashboard/hooks/use-remote-update-flash";
import { useSetPresence } from "~/features/dashboard/hooks/use-set-presence";
import { formatRelativeTime } from "~/features/dashboard/utils/format";
import { type PresenceState } from "~/types/dashboard";

import type { api } from "../../../../convex/_generated/api";

export function useDashboardPresence() {
  const { nowMs } = useBoardClock();
  const partner = useSuspenseQuery(dashboardPresenceQuery()).data;
  const setPresence = useSetPresence();
  const partnerFingerprint =
    partner === null ? "none" : [partner.state, partner.etaHm ?? "", partner.updatedAt].join("|");
  const { flashRef: partnerFlashRef, suppressNextFlash } = useRemoteUpdateFlash(partnerFingerprint);

  function onSetPresence(
    state: PresenceState,
    etaHm?: FunctionArgs<typeof api.mutations.partnerStatus.setStatus.setStatus>["etaHm"],
  ) {
    const releaseFlashSuppression = suppressNextFlash();

    setPresence.mutate(
      { etaHm, state },
      {
        onError: () => {
          releaseFlashSuppression();
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
    partnerFlashRef,
    partnerUpdatedRelativeLabel:
      partner === null ? "未更新" : formatRelativeTime(partner.updatedAt, nowMs),
  } as const;
}
