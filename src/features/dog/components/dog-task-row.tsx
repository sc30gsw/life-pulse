import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Field, Form, reset, useForm } from "@formisch/react";
import { ActionIcon, Group, Text, TextInput } from "@mantine/core";
import { IconCheck, IconGripVertical, IconPencil, IconTrash, IconX } from "@tabler/icons-react";
import { cn } from "cnfast";
import { useState } from "react";

import type { Doc } from "~/../convex/_generated/dataModel";
import { useDogTasks } from "~/features/dog/hooks/use-dog-tasks";
import { DogTaskNameSchema } from "~/features/dog/schemas/dog-task-name-schema";
import { ACCENT_CLASSES } from "~/types/dashboard";

type DogTaskRowProps = Pick<ReturnType<typeof useDogTasks>, "onArchive" | "onRename"> & {
  task: Doc<"dogTasks">;
};

export function DogTaskRow({ onArchive, onRename, task }: DogTaskRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task._id });
  const renameTaskForm = useForm({
    initialInput: { name: task.name },
    schema: DogTaskNameSchema,
  });
  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function startEditing() {
    reset(renameTaskForm, { initialInput: { name: task.name } });
    setIsEditing(true);
  }

  if (isEditing) {
    return (
      <li className="list-none">
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
              className={cn(
                ACCENT_CLASSES.good.border,
                ACCENT_CLASSES.good.bg,
                ACCENT_CLASSES.good.text,
                "focus-visible:outline-good transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100",
              )}
              type="submit"
              variant="default"
            >
              <IconCheck size={16} />
            </ActionIcon>
            <ActionIcon
              aria-label="キャンセル"
              className={cn(
                ACCENT_CLASSES.coral.border,
                ACCENT_CLASSES.coral.bg,
                ACCENT_CLASSES.coral.text,
                "focus-visible:outline-coral transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100",
              )}
              onClick={() => setIsEditing(false)}
              type="button"
              variant="default"
            >
              <IconX size={16} />
            </ActionIcon>
          </Group>
        </Form>
      </li>
    );
  }

  return (
    <Group
      ref={setNodeRef}
      className={cn(
        "border-bd bg-panel-2 rounded-xl border px-3.5 py-2.5 transition",
        isDragging ? "border-good bg-good/16 shadow-card opacity-70" : null,
      )}
      component="li"
      gap={12}
      style={sortableStyle}
      wrap="nowrap"
    >
      <button
        {...attributes}
        {...listeners}
        aria-label={`${task.name} をドラッグして並び替え`}
        className="text-faint hover:text-tx focus-visible:outline-blue flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-md transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:cursor-grabbing"
        ref={setActivatorNodeRef}
        type="button"
      >
        <IconGripVertical size={18} />
      </button>
      <Text size="sm" fw={500} className="text-tx flex-1">
        {task.name}
      </Text>
      <Group gap={4} wrap="nowrap">
        <ActionIcon
          aria-label="名前を変更"
          className={cn(
            ACCENT_CLASSES.blue.border,
            ACCENT_CLASSES.blue.bg,
            ACCENT_CLASSES.blue.text,
            "focus-visible:outline-blue transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100",
          )}
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
