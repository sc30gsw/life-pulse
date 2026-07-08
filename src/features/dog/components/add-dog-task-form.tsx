import { Field, Form, reset, useForm } from "@formisch/react";
import { Button, Group, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";

import { useCreateDogTask } from "~/features/dog/hooks/use-create-dog-task";
import { DogTaskNameSchema } from "~/features/dog/schemas/dog-task-name-schema";
import { ACCENT_SOLID_STYLE } from "~/types/dashboard";

export function AddDogTaskForm() {
  const createDogTask = useCreateDogTask();
  const addDogTaskForm = useForm({
    initialInput: { name: "" },
    schema: DogTaskNameSchema,
  });

  return (
    <Form
      of={addDogTaskForm}
      onSubmit={(output) => {
        createDogTask.mutate(output, {
          onError: () => {
            notifications.show({
              color: "red",
              message: "タスクの追加に失敗しました",
              title: "エラー",
            });
          },
          onSuccess: () => {
            notifications.show({
              color: "green",
              message: `「${output.name}」を追加しました`,
              title: "追加しました",
            });
            reset(addDogTaskForm);
          },
        });
      }}
    >
      <Group align="flex-start" gap="sm" wrap="nowrap">
        <Field of={addDogTaskForm} path={["name"]}>
          {(field) => (
            <TextInput
              {...field.props}
              aria-label="新しいタスク名"
              className="flex-1"
              disabled={addDogTaskForm.isSubmitting}
              error={field.errors?.[0]}
              placeholder="新しいタスク名"
              value={field.input}
            />
          )}
        </Field>

        <Button
          className="shrink-0 transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
          disabled={addDogTaskForm.isSubmitting}
          leftSection={<IconPlus size={16} />}
          loading={addDogTaskForm.isSubmitting}
          style={ACCENT_SOLID_STYLE.good}
          type="submit"
        >
          追加
        </Button>
      </Group>
    </Form>
  );
}
