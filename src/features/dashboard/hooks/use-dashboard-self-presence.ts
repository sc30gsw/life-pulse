import { notifications } from "@mantine/notifications";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { FunctionArgs } from "convex/server";

import { dashboardSelfPresenceQuery } from "~/features/dashboard/api/dashboard-self-presence-query";
import { useBoardClock } from "~/features/dashboard/hooks/use-board-clock";
import { useRemoteUpdateFlash } from "~/features/dashboard/hooks/use-remote-update-flash";
import { useSetPresence } from "~/features/dashboard/hooks/use-set-presence";
import { formatRelativeTime } from "~/features/dashboard/utils/format";
import { type PresenceState } from "~/types/dashboard";

import type { api } from "../../../../convex/_generated/api";

export function useDashboardSelfPresence() {
  const { nowMs } = useBoardClock();
  const self = useSuspenseQuery(dashboardSelfPresenceQuery()).data;
  const setPresence = useSetPresence();
  const selfFingerprint =
    self === null ? "none" : [self.state, self.etaHm ?? "", self.updatedAt].join("|");
  const { flashRef: selfFlashRef, suppressNextFlash } = useRemoteUpdateFlash(selfFingerprint);

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
            message: `本人: ${state}`,
            title: "更新しました",
          });
        },
      },
    );
  }

  return {
    onSetPresence,
    self,
    selfFlashRef,
    selfUpdatedRelativeLabel: self === null ? "未更新" : formatRelativeTime(self.updatedAt, nowMs),
  } as const;
}
