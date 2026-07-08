import { Field, Form, useForm } from "@formisch/react";
import { Button, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Shimmer } from "@shimmer-from-structure/react";

import { DOG_PAGE_COPY, DOG_PROFILE_COPY } from "~/features/dog/constants/dog-profile";
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
              message: DOG_PROFILE_COPY.notification.profileSaveErrorMessage,
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
              label={DOG_PAGE_COPY.sections.name}
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
          {isCreating ? DOG_PROFILE_COPY.actions.create : DOG_PROFILE_COPY.actions.save}
        </Button>
      </Stack>
    </Form>
  );
}

export function DogNameFormFallback() {
  return (
    <Shimmer loading>
      <Stack gap="md">
        <TextInput
          disabled
          label={DOG_PAGE_COPY.sections.name}
          placeholder={DOG_PAGE_COPY.sections.name}
          value=""
        />
        <Button className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100">
          {DOG_PROFILE_COPY.actions.create}
        </Button>
      </Stack>
    </Shimmer>
  );
}
