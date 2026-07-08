import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSuspenseQuery } from "@tanstack/react-query";

import type { Doc } from "~/../convex/_generated/dataModel";
import { dogTasksQuery } from "~/features/dog/api/dog-tasks-query";
import { useArchiveDogTask } from "~/features/dog/hooks/use-archive-dog-task";
import { useMoveDogTask } from "~/features/dog/hooks/use-move-dog-task";
import { useRenameDogTask } from "~/features/dog/hooks/use-rename-dog-task";

function showError(message: string) {
  notifications.show({ color: "red", message, title: "エラー" });
}

function showSuccess(title: string, message: string) {
  notifications.show({ color: "green", message, title });
}

export function useDogTasks() {
  const tasks = useSuspenseQuery(dogTasksQuery()).data;
  const archiveDogTask = useArchiveDogTask();
  const moveDogTask = useMoveDogTask();
  const renameDogTask = useRenameDogTask();

  function onArchive(task: Doc<"dogTasks">) {
    modals.openConfirmModal({
      cancelProps: { variant: "subtle" },
      centered: true,
      confirmProps: { color: "red" },
      labels: { cancel: "戻る", confirm: "削除する" },
      onConfirm: () => {
        archiveDogTask.mutate(
          { taskId: task._id },
          {
            onError: () => {
              showError("タスクの削除に失敗しました");
            },
            onSuccess: () => {
              showSuccess("削除しました", `「${task.name}」を削除しました`);
            },
          },
        );
      },
      styles: {
        body: { color: "var(--tx)" },
        content: {
          backgroundColor: "var(--panel)",
          border: "1px solid var(--bd2)",
          color: "var(--tx)",
        },
        header: { backgroundColor: "var(--panel)", color: "var(--tx)" },
        title: { color: "var(--tx)", fontWeight: 700 },
      },
      title: `「${task.name}」を削除しますか？`,
    });
  }

  function onMove(taskId: Doc<"dogTasks">["_id"], direction: "down" | "up") {
    moveDogTask.mutate(
      { direction, taskId },
      {
        onError: () => {
          showError("並び替えに失敗しました");
        },
      },
    );
  }

  function onRename(taskId: Doc<"dogTasks">["_id"], name: Doc<"dogTasks">["name"]) {
    renameDogTask.mutate(
      { name, taskId },
      {
        onError: () => {
          showError("タスク名の変更に失敗しました");
        },
        onSuccess: () => {
          showSuccess("変更しました", "タスク名を変更しました");
        },
      },
    );
  }

  return { onArchive, onMove, onRename, tasks } as const;
}
