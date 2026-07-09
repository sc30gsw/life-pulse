import { Field, Form, reset, useForm } from "@formisch/react";
import { Button, Stack, PasswordInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconLock } from "@tabler/icons-react";
import { getRouteApi } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { Result } from "better-result";
import { useAction } from "convex/react";
import { ConvexError } from "convex/values";
import { useTransition } from "react";

import { api } from "~/../convex/_generated/api";
import {
  ResetPasswordSchema,
  type ResetPasswordSchemaType,
} from "~/features/auth/schemas/password-reset-schema";
import { AuthError } from "~/features/auth/types/auth-error";
import { getFieldError } from "~/utils/field-error";

const routeApi = getRouteApi("/reset-password");

export function ResetPasswordForm() {
  const { token } = routeApi.useSearch();
  const navigate = useNavigate();
  const resetPassword = useAction(api.actions.auth.resetPassword.resetPassword);
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    initialInput: { confirmPassword: "", newPassword: "" },
    revalidate: "input",
    schema: ResetPasswordSchema,
    validate: "blur",
  });
  const isSubmitting = isPending || form.isSubmitting;

  function submit(output: ResetPasswordSchemaType) {
    startTransition(async () => {
      const result = await Result.tryPromise({
        catch: (cause) =>
          new AuthError({
            cause,
            message: cause instanceof ConvexError ? String(cause.data) : "更新に失敗しました",
          }),
        try: () => resetPassword({ newPassword: output.newPassword, token }),
      });

      if (Result.isError(result)) {
        notifications.show({
          color: "red",
          message: result.error.message,
          title: "更新エラー",
        });

        return;
      }

      reset(form);

      notifications.show({
        color: "green",
        message: "パスワードを更新しました",
        title: "更新完了",
      });

      navigate({ to: "/login" });
    });
  }

  return (
    <Form of={form} onSubmit={submit}>
      <Stack gap="lg">
        <Field of={form} path={["newPassword"]}>
          {(field) => (
            <PasswordInput
              {...field.props}
              autoComplete="new-password"
              error={getFieldError(field, form.isSubmitted)}
              label="新しいパスワード"
              leftSection={<IconLock size={16} />}
              placeholder="12文字以上・英大小文字+数字"
              required
              value={field.input}
              disabled={isSubmitting}
            />
          )}
        </Field>
        <Field of={form} path={["confirmPassword"]}>
          {(field) => (
            <PasswordInput
              {...field.props}
              autoComplete="new-password"
              error={getFieldError(field, form.isSubmitted)}
              label="新しいパスワード(確認)"
              leftSection={<IconLock size={16} />}
              placeholder="もう一度入力"
              required
              value={field.input}
              disabled={isSubmitting}
            />
          )}
        </Field>
        <Button
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting || token.length === 0}
          type="submit"
        >
          パスワードを更新
        </Button>
      </Stack>
    </Form>
  );
}
