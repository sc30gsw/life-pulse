import { ActionIcon, Group, Stack, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconChevronDown, IconChevronUp, IconPencil, IconTrash } from "@tabler/icons-react";

import { DogTaskRow } from "~/features/dog/components/dog-task-row";
import { DOG_TASK_COPY } from "~/features/dog/constants/dog-profile";
import { useDogTasks } from "~/features/dog/hooks/use-dog-tasks";

export function DogTaskList() {
  const { onArchive, onMove, onRename, tasks } = useDogTasks();

  if (tasks.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        {DOG_TASK_COPY.states.empty}
      </Text>
    );
  }

  return (
    <Stack gap={8}>
      {tasks.map((task, index) => (
        <DogTaskRow
          isFirst={index === 0}
          isLast={index === tasks.length - 1}
          key={task._id}
          onArchive={onArchive}
          onMove={onMove}
          onRename={onRename}
          task={task}
        />
      ))}
    </Stack>
  );
}

export function DogTaskListFallback() {
  return (
    <Shimmer loading>
      <Stack gap={8}>
        {DOG_TASK_COPY.dashboard.fallbackTaskNames.map((label) => (
          <Group
            key={label}
            className="border-bd bg-panel-2 rounded-xl border px-3.5 py-2.5"
            gap={12}
            wrap="nowrap"
          >
            <Text size="sm" fw={500} className="flex-1">
              {label}
            </Text>
            <Group gap={4} wrap="nowrap">
              <ActionIcon className="border-bd bg-inset" disabled variant="default">
                <IconChevronUp size={16} />
              </ActionIcon>
              <ActionIcon className="border-bd bg-inset" disabled variant="default">
                <IconChevronDown size={16} />
              </ActionIcon>
              <ActionIcon className="border-bd bg-inset" disabled variant="default">
                <IconPencil size={16} />
              </ActionIcon>
              <ActionIcon className="border-bd bg-inset" disabled variant="default">
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          </Group>
        ))}
      </Stack>
    </Shimmer>
  );
}
