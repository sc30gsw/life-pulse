import { useAuthActions } from "@convex-dev/auth/react";
import { Field, Form, useForm } from "@formisch/react";
import { Button, Loader, PasswordInput, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-router";
import { Result } from "better-result";
import { ConvexError } from "convex/values";

import { getFieldError } from "~/features/auth/components/field-error";
import { LoginSchema } from "~/features/auth/schemas/login-schema";
import { AuthError } from "~/features/auth/types/auth-error";

export function LoginForm() {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
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
          try: async () => {
            await signIn("password", { email: output.email, password: output.password });
            await navigate({ to: "/" });
          },
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
              placeholder="you@example.com"
              required
              type="email"
              value={field.input}
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
              placeholder="パスワードを入力"
              required
              value={field.input}
            />
          )}
        </Field>
        <Button fullWidth loading={form.isSubmitting} type="submit">
          ログイン {form.isSubmitting ? <Loader size="sm" /> : null}
        </Button>
      </Stack>
    </Form>
  );
}
