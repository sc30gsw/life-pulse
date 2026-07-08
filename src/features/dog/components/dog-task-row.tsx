import { Field, Form, reset, useForm } from "@formisch/react";
import { ActionIcon, Group, Text, TextInput } from "@mantine/core";
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconPencil,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { cn } from "cnfast";
import { useState } from "react";

import type { Doc } from "~/../convex/_generated/dataModel";
import { useDogTasks } from "~/features/dog/hooks/use-dog-tasks";
import { DogTaskNameSchema } from "~/features/dog/schemas/dog-task-name-schema";
import { ACCENT_CLASSES } from "~/types/dashboard";

type DogTaskRowProps = Pick<ReturnType<typeof useDogTasks>, "onArchive" | "onMove" | "onRename"> & {
  isFirst: boolean;
  isLast: boolean;
  task: Doc<"dogTasks">;
};

export function DogTaskRow({
  isFirst,
  isLast,
  onArchive,
  onMove,
  onRename,
  task,
}: DogTaskRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const renameTaskForm = useForm({
    initialInput: { name: task.name },
    schema: DogTaskNameSchema,
  });

  function startEditing() {
    reset(renameTaskForm, { initialInput: { name: task.name } });
    setIsEditing(true);
  }

  if (isEditing) {
    return (
      <Form
        of={renameTaskForm}
        onSubmit={(output) => {
          onRename(task._id, output.name);
          setIsEditing(false);
        }}
      >
        <Group
          className="border-bd bg-panel-2 rounded-xl border px-3.5 py-2.5"
          gap={8}
          wrap="nowrap"
        >
          <Field of={renameTaskForm} path={["name"]}>
            {(field) => (
              <TextInput
                {...field.props}
                aria-label="タスク名"
                className="flex-1"
                error={field.errors?.[0]}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsEditing(false);
                  }
                }}
                size="sm"
                value={field.input}
              />
            )}
          </Field>
          <ActionIcon
            aria-label="保存する"
            className="border-bd bg-inset transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
            type="submit"
            variant="default"
          >
            <IconCheck size={16} />
          </ActionIcon>
          <ActionIcon
            aria-label="キャンセル"
            className="border-bd bg-inset transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
            onClick={() => setIsEditing(false)}
            type="button"
            variant="default"
          >
            <IconX size={16} />
          </ActionIcon>
        </Group>
      </Form>
    );
  }

  return (
    <Group className="border-bd bg-panel-2 rounded-xl border px-3.5 py-2.5" gap={12} wrap="nowrap">
      <Text size="sm" fw={500} className="text-tx flex-1">
        {task.name}
      </Text>
      <Group gap={4} wrap="nowrap">
        <ActionIcon
          aria-label="上へ移動"
          className="border-bd bg-inset transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
          disabled={isFirst}
          onClick={() => onMove(task._id, "up")}
          variant="default"
        >
          <IconChevronUp size={16} />
        </ActionIcon>
        <ActionIcon
          aria-label="下へ移動"
          className="border-bd bg-inset transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
          disabled={isLast}
          onClick={() => onMove(task._id, "down")}
          variant="default"
        >
          <IconChevronDown size={16} />
        </ActionIcon>
        <ActionIcon
          aria-label="名前を変更"
          className="border-bd bg-inset transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
          onClick={startEditing}
          variant="default"
        >
          <IconPencil size={16} />
        </ActionIcon>
        <ActionIcon
          aria-label="削除"
          className={cn(
            ACCENT_CLASSES.coral.border,
            ACCENT_CLASSES.coral.bg,
            ACCENT_CLASSES.coral.text,
            "transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100",
          )}
          onClick={() => onArchive(task)}
          variant="default"
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
    </Group>
  );
}
