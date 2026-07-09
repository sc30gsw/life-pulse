import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ActionIcon, Group, Stack, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconGripVertical, IconPencil, IconTrash } from "@tabler/icons-react";

import type { Doc } from "~/../convex/_generated/dataModel";
import { DogTaskRow } from "~/features/dog/components/dog-task-row";
import { useDogTasks } from "~/features/dog/hooks/use-dog-tasks";

export function DogTaskList() {
  const { onArchive, onRename, onReorder, tasks } = useDogTasks();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over === null || active.id === over.id) {
      return;
    }

    void onReorder(
      String(active.id) as Doc<"dogTasks">["_id"],
      String(over.id) as Doc<"dogTasks">["_id"],
    );
  }

  if (tasks.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        お世話タスクがありません。上のフォームから追加してください。
      </Text>
    );
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} sensors={sensors}>
      <SortableContext items={tasks.map((task) => task._id)} strategy={verticalListSortingStrategy}>
        <Stack className="m-0 list-none p-0" component="ul" gap={8}>
          {tasks.map((task) => (
            <DogTaskRow key={task._id} onArchive={onArchive} onRename={onRename} task={task} />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  );
}

const FALLBACK_TASK_NAMES = ["朝散歩", "朝ごはん", "薬"] as const;

export function DogTaskListFallback() {
  return (
    <Shimmer loading>
      <Stack gap={8}>
        {FALLBACK_TASK_NAMES.map((label) => (
          <Group
            key={label}
            className="border-bd bg-panel-2 rounded-xl border px-3.5 py-2.5"
            gap={12}
            wrap="nowrap"
          >
            <Text size="sm" fw={500} className="flex-1">
              {label}
            </Text>
            <IconGripVertical className="text-faint" size={18} />
            <Group gap={4} wrap="nowrap">
              <ActionIcon className="border-bd bg-inset text-tx" disabled variant="default">
                <IconPencil size={16} />
              </ActionIcon>
              <ActionIcon className="border-bd bg-inset text-tx" disabled variant="default">
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          </Group>
        ))}
      </Stack>
    </Shimmer>
  );
}
