import { Field, Form, reset, useForm } from "@formisch/react";
import { Button, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconMail } from "@tabler/icons-react";
import { Result } from "better-result";
import { useAction } from "convex/react";
import { ConvexError } from "convex/values";
import { useTransition } from "react";

import { api } from "~/../convex/_generated/api";
import {
  ForgotPasswordSchema,
  type ForgotPasswordSchemaType,
} from "~/features/auth/schemas/password-reset-schema";
import { AuthError } from "~/features/auth/types/auth-error";
import { getFieldError } from "~/utils/field-error";

export function ForgotPasswordForm() {
  const requestPasswordReset = useAction(
    api.actions.auth.requestPasswordReset.requestPasswordReset,
  );
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    initialInput: { email: "" },
    revalidate: "input",
    schema: ForgotPasswordSchema,
    validate: "blur",
  });
  const isSubmitting = isPending || form.isSubmitting;

  function submit(output: ForgotPasswordSchemaType) {
    startTransition(async () => {
      const result = await Result.tryPromise({
        catch: (cause) =>
          new AuthError({
            cause,
            message: cause instanceof ConvexError ? String(cause.data) : "送信に失敗しました",
          }),
        try: () => requestPasswordReset(output),
      });

      if (Result.isError(result)) {
        notifications.show({
          color: "red",
          message: result.error.message,
          title: "送信エラー",
        });

        return;
      }

      reset(form);

      notifications.show({
        color: "green",
        message: "登録済みの場合、再設定メールを送信しました",
        title: "送信完了",
      });
    });
  }

  return (
    <Form of={form} onSubmit={submit}>
      <Stack gap="lg">
        <Field of={form} path={["email"]}>
          {(field) => (
            <TextInput
              {...field.props}
              autoComplete="username"
              error={getFieldError(field, form.isSubmitted)}
              label="メールアドレス"
              leftSection={<IconMail size={16} />}
              placeholder="you@example.com"
              required
              type="email"
              value={field.input}
              disabled={isSubmitting}
            />
          )}
        </Field>
        <Button fullWidth loading={isSubmitting} disabled={isSubmitting} type="submit">
          再設定メールを送信
        </Button>
      </Stack>
    </Form>
  );
}
