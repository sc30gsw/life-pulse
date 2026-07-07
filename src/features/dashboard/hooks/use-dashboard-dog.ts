import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSuspenseQuery } from "@tanstack/react-query";

import { dashboardDogQuery } from "~/features/dashboard/api/dashboard-dog-query";
import { useBoardClock } from "~/features/dashboard/hooks/use-board-clock";
import { useLogDogEvent } from "~/features/dashboard/hooks/use-log-dog-event";
import { useUndoDogEvent } from "~/features/dashboard/hooks/use-undo-dog-event";
import { toDogCareItems } from "~/features/dashboard/utils/format";
import { ACCENT_SOLID_STYLE, DOG_EVENT_LABELS, type DogEventKind } from "~/types/dashboard";

export function useDashboardDog() {
  const { dateJst } = useBoardClock();
  const dog = useSuspenseQuery(dashboardDogQuery(dateJst)).data;
  const logDogEvent = useLogDogEvent();
  const undoDogEvent = useUndoDogEvent();
  const dogCare = toDogCareItems(dog.events);

  function onToggleDogCare(kind: DogEventKind) {
    const current = dogCare.find((item) => item.kind === kind);

    if (current === undefined) {
      return;
    }

    if (!current.done) {
      logDogEvent.mutate(
        { dateJst, kind },
        {
          onError: () => {
            notifications.show({ color: "red", message: "記録に失敗しました", title: "エラー" });
          },
          onSuccess: () => {
            notifications.show({
              color: "green",
              message: `${dog.dogName}の${DOG_EVENT_LABELS[kind]}を記録しました`,
              title: "記録しました",
            });
          },
        },
      );

      return;
    }

    const loggedEvent = dog.events.find((event) => event.kind === kind);
    if (loggedEvent === undefined) {
      return;
    }

    modals.openConfirmModal({
      centered: true,
      cancelProps: { className: "border-bd bg-inset text-tx hover:bg-panel-2" },
      confirmProps: { style: ACCENT_SOLID_STYLE.coral },
      labels: { cancel: "キャンセル", confirm: "取り消す" },
      onConfirm: () => {
        undoDogEvent.mutate(
          { dateJst, eventId: loggedEvent.id },
          {
            onError: () => {
              notifications.show({ color: "red", message: "取消に失敗しました", title: "エラー" });
            },
            onSuccess: () => {
              notifications.show({
                color: "red",
                message: `${dog.dogName}の${DOG_EVENT_LABELS[kind]}を取り消しました`,
                title: "取り消しました",
              });
            },
          },
        );
      },
      styles: {
        body: { color: "var(--text)" },
        content: {
          backgroundColor: "var(--panel)",
          border: "1px solid var(--bd2)",
          color: "var(--text)",
        },
        header: { backgroundColor: "var(--panel)", color: "var(--text)" },
        title: { color: "var(--text)", fontWeight: 700 },
      },
      title: "記録を取り消しますか?",
    });
  }

  // Flash-on-remote-update (server push detection) is deferred past W1 — see the wiring plan.
  return { dogCare, dogFlash: false, dogName: dog.dogName, onToggleDogCare } as const;
}
