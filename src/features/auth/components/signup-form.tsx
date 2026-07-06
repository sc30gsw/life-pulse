import { useAuthActions } from "@convex-dev/auth/react";
import { Field, Form, useForm } from "@formisch/react";
import { Button, Loader, PasswordInput, Select, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-router";
import { Result } from "better-result";
import { ConvexError } from "convex/values";

import { getFieldError } from "~/features/auth/components/field-error";
import { useEnsureUser } from "~/features/auth/hooks/use-ensure-user";
import { SignupSchema } from "~/features/auth/schemas/signup-schema";
import { AuthError } from "~/features/auth/types/auth-error";

export function SignupForm() {
  const { signIn } = useAuthActions();
  const ensureUser = useEnsureUser();
  const navigate = useNavigate();
  const form = useForm({ revalidate: "input", schema: SignupSchema, validate: "blur" });

  return (
    <Form
      of={form}
      onSubmit={async (output) => {
        const result = await Result.tryPromise({
          catch: (cause) =>
            new AuthError({
              cause,
              message: cause instanceof ConvexError ? String(cause.data) : "登録に失敗しました",
            }),
          try: async () => {
            await signIn("password", { email: output.email, password: output.password });
            await ensureUser.mutateAsync({
              displayName: output.displayName,
              role: output.role,
            });

            await navigate({ to: "/" });
          },
        });

        if (Result.isError(result)) {
          notifications.show({ color: "red", message: result.error.message, title: "登録エラー" });
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
        <Field of={form} path={["displayName"]}>
          {(field) => (
            <TextInput
              {...field.props}
              autoComplete="name"
              error={getFieldError(field, form.isSubmitted)}
              label="表示名"
              placeholder="山田 太郎"
              required
              value={field.input}
            />
          )}
        </Field>
        <Field of={form} path={["role"]}>
          {(field) => (
            <Select
              {...field.props}
              classNames={{
                dropdown: "border-bd bg-panel-2",
                option: "text-tx hover:bg-panel hover:text-tx active:bg-panel active:text-tx",
              }}
              data={[
                { label: "本人", value: "self" },
                { label: "パートナー", value: "partner" },
              ]}
              error={getFieldError(field, form.isSubmitted)}
              label="ロール"
              onChange={(value) =>
                field.onChange((value ?? undefined) as "partner" | "self" | undefined)
              }
              placeholder="選択してください"
              value={field.input ?? null}
            />
          )}
        </Field>
        <Field of={form} path={["password"]}>
          {(field) => (
            <PasswordInput
              {...field.props}
              autoComplete="new-password"
              error={getFieldError(field, form.isSubmitted)}
              label="パスワード"
              placeholder="12文字以上・英大小文字+数字"
              required
              value={field.input}
            />
          )}
        </Field>
        <Field of={form} path={["confirmPassword"]}>
          {(field) => (
            <PasswordInput
              {...field.props}
              autoComplete="new-password"
              error={getFieldError(field, form.isSubmitted)}
              label="パスワード(確認)"
              placeholder="もう一度入力"
              required
              value={field.input}
            />
          )}
        </Field>
        <Button fullWidth loading={form.isSubmitting} type="submit">
          アカウント作成
          {form.isSubmitting ? <Loader size="sm" /> : null}
        </Button>
      </Stack>
    </Form>
  );
}
