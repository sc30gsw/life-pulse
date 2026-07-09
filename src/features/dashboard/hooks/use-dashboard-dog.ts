import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSuspenseQuery } from "@tanstack/react-query";

import { dashboardDogQuery } from "~/features/dashboard/api/dashboard-dog-query";
import { useBoardClock } from "~/features/dashboard/hooks/use-board-clock";
import { useLogDogEvent } from "~/features/dashboard/hooks/use-log-dog-event";
import { useRemoteUpdateFlash } from "~/features/dashboard/hooks/use-remote-update-flash";
import { useUndoDogEvent } from "~/features/dashboard/hooks/use-undo-dog-event";
import { toDogCareItems } from "~/features/dashboard/utils/format";
import { ACCENT_SOLID_STYLE } from "~/types/dashboard";

export function useDashboardDog() {
  const { dateJst } = useBoardClock();
  const dog = useSuspenseQuery(dashboardDogQuery(dateJst)).data;
  const logDogEvent = useLogDogEvent();
  const undoDogEvent = useUndoDogEvent();
  const dogCare = dog === null ? [] : toDogCareItems(dog.tasks);
  const dogFingerprint =
    dog === null
      ? "none"
      : [
          dog.dogName,
          ...dog.tasks.map((task) =>
            [task.taskId, task.done ? "done" : "todo", task.eventId ?? "", task.at ?? ""].join(":"),
          ),
        ].join("|");
  const { flashRef: dogFlashRef, suppressNextFlash } = useRemoteUpdateFlash(dogFingerprint);

  function onToggleDogCare(taskId: (typeof dogCare)[number]["taskId"]) {
    const current = dogCare.find((item) => item.taskId === taskId);

    if (current === undefined) {
      return;
    }

    if (!current.done) {
      const releaseFlashSuppression = suppressNextFlash();

      logDogEvent.mutate(
        { dateJst, taskId },
        {
          onError: () => {
            releaseFlashSuppression();
            notifications.show({
              color: "red",
              message: "記録に失敗しました",
              title: "エラー",
            });
          },
          onSuccess: () => {
            notifications.show({
              color: "green",
              message: `${dog?.dogName ?? "犬"}の${current.name}を記録しました`,
              title: "記録しました",
            });
          },
        },
      );

      return;
    }

    const eventId = current.eventId;

    if (eventId === null) {
      return;
    }

    modals.openConfirmModal({
      centered: true,
      cancelProps: { className: "border-bd bg-inset text-tx hover:bg-panel-2" },
      confirmProps: { style: ACCENT_SOLID_STYLE.coral },
      labels: { cancel: "キャンセル", confirm: "取り消す" },
      onConfirm: () => {
        const releaseFlashSuppression = suppressNextFlash();

        undoDogEvent.mutate(
          { dateJst, eventId },
          {
            onError: () => {
              releaseFlashSuppression();
              notifications.show({
                color: "red",
                message: "取消に失敗しました",
                title: "エラー",
              });
            },
            onSuccess: () => {
              notifications.show({
                color: "red",
                message: `${dog?.dogName ?? "犬"}の${current.name}を取り消しました`,
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

  return {
    dogCare,
    dogFlashRef,
    dogImageUrl: dog?.dogImageUrl ?? null,
    dogName: dog?.dogName ?? null,
    hasDog: dog !== null,
    onToggleDogCare,
  } as const;
}
