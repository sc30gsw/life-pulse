import { useAuthActions } from "@convex-dev/auth/react";
import { Field, Form, useForm } from "@formisch/react";
import { Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconLock, IconLogin2, IconMail } from "@tabler/icons-react";
import { Result } from "better-result";
import { ConvexError } from "convex/values";

import { LoginSchema } from "~/features/auth/schemas/login-schema";
import { AuthError } from "~/features/auth/types/auth-error";
import { getFieldError } from "~/utils/field-error";

export function LoginForm() {
  const { signIn } = useAuthActions();
  const form = useForm({ revalidate: "input", schema: LoginSchema, validate: "blur" });

  return (
    <Form
      of={form}
      onSubmit={async (output) => {
        const result = await Result.tryPromise({
          catch: (cause) =>
            new AuthError({
              cause,
              message: cause instanceof ConvexError ? String(cause.data) : "ログインに失敗しました",
            }),

          try: () =>
            signIn("password", {
              email: output.email,
              flow: "signIn",
              password: output.password,
            }),
        });

        if (Result.isError(result)) {
          notifications.show({
            color: "red",
            message: result.error.message,
            title: "ログインエラー",
          });
        }
      }}
    >
      <Stack gap="md">
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
              disabled={form.isSubmitting}
            />
          )}
        </Field>
        <Field of={form} path={["password"]}>
          {(field) => (
            <PasswordInput
              {...field.props}
              autoComplete="current-password"
              error={getFieldError(field, form.isSubmitted)}
              label="パスワード"
              leftSection={<IconLock size={16} />}
              placeholder="パスワードを入力"
              required
              value={field.input}
              disabled={form.isSubmitting}
            />
          )}
        </Field>
        <Button
          className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
          fullWidth
          leftSection={<IconLogin2 size={18} />}
          loading={form.isSubmitting}
          disabled={form.isSubmitting}
          type="submit"
        >
          ログイン
        </Button>
      </Stack>
    </Form>
  );
}
