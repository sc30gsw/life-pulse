import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSuspenseQuery } from "@tanstack/react-query";

import type { Doc } from "~/../convex/_generated/dataModel";
import { dogTasksQuery } from "~/features/dog/api/dog-tasks-query";
import { DOG_TASK_COPY } from "~/features/dog/constants/dog-profile";
import { useArchiveDogTask } from "~/features/dog/hooks/use-archive-dog-task";
import { useMoveDogTask } from "~/features/dog/hooks/use-move-dog-task";
import { useRenameDogTask } from "~/features/dog/hooks/use-rename-dog-task";

function showError(message: string) {
  notifications.show({ color: "red", message, title: DOG_TASK_COPY.notification.errorTitle });
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
      labels: {
        cancel: DOG_TASK_COPY.actions.undoDelete,
        confirm: DOG_TASK_COPY.actions.confirmDelete,
      },
      onConfirm: () => {
        archiveDogTask.mutate(
          { taskId: task._id },
          {
            onError: () => {
              showError(DOG_TASK_COPY.notification.archiveErrorMessage);
            },
            onSuccess: () => {
              showSuccess(
                DOG_TASK_COPY.notification.archivedTitle,
                DOG_TASK_COPY.notification.archivedMessage(task.name),
              );
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
      title: DOG_TASK_COPY.notification.archiveConfirmTitle(task.name),
    });
  }

  function onMove(taskId: Doc<"dogTasks">["_id"], direction: "down" | "up") {
    moveDogTask.mutate(
      { direction, taskId },
      {
        onError: () => {
          showError(DOG_TASK_COPY.notification.moveErrorMessage);
        },
      },
    );
  }

  function onRename(taskId: Doc<"dogTasks">["_id"], name: Doc<"dogTasks">["name"]) {
    renameDogTask.mutate(
      { name, taskId },
      {
        onError: () => {
          showError(DOG_TASK_COPY.notification.renameErrorMessage);
        },
        onSuccess: () => {
          showSuccess(
            DOG_TASK_COPY.notification.renamedTitle,
            DOG_TASK_COPY.notification.renamedMessage,
          );
        },
      },
    );
  }

  return { onArchive, onMove, onRename, tasks } as const;
}
