import { Field, Form, useForm } from "@formisch/react";
import { Button, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Shimmer } from "@shimmer-from-structure/react";

import { useDog } from "~/features/dog/hooks/use-dog";
import { useUpdateDog } from "~/features/dog/hooks/use-update-dog";
import { DogNameSchema } from "~/features/dog/schemas/dog-name-schema";
import { ACCENT_SOLID_STYLE } from "~/types/dashboard";

export function DogNameForm() {
  const { data: dog } = useDog();
  const updateDog = useUpdateDog();
  const isCreating = dog === null;
  const dogNameForm = useForm({
    initialInput: { name: dog?.name ?? "" },
    schema: DogNameSchema,
  });

  return (
    <Form
      of={dogNameForm}
      onSubmit={(output) => {
        updateDog.mutate(output, {
          onError: () => {
            notifications.show({
              color: "red",
              message: "犬プロフィールの保存に失敗しました",
              title: "エラー",
            });
          },
          onSuccess: () => {
            notifications.show({
              color: "green",
              message: isCreating
                ? `犬プロフィールを「${output.name}」で作成しました`
                : `名前を「${output.name}」に変更しました`,
              title: isCreating ? "作成しました" : "変更しました",
            });
          },
        });
      }}
    >
      <Stack gap="md">
        <Field of={dogNameForm} path={["name"]}>
          {(field) => (
            <TextInput
              {...field.props}
              disabled={dogNameForm.isSubmitting}
              error={field.errors?.[0]}
              label="犬の名前"
              value={field.input}
            />
          )}
        </Field>

        <Button
          className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
          disabled={dogNameForm.isSubmitting}
          loading={dogNameForm.isSubmitting}
          style={ACCENT_SOLID_STYLE.good}
          type="submit"
        >
          {isCreating ? "作成する" : "保存する"}
        </Button>
      </Stack>
    </Form>
  );
}

export function DogNameFormFallback() {
  return (
    <Shimmer loading>
      <Stack gap="md">
        <TextInput disabled label="犬の名前" placeholder="犬の名前" value="" />
        <Button className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100">
          作成する
        </Button>
      </Stack>
    </Shimmer>
  );
}
