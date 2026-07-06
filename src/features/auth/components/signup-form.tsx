import { useAuthActions } from "@convex-dev/auth/react";
import { Field, Form, useForm } from "@formisch/react";
import { Button, PasswordInput, Select, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconLock, IconMail, IconUser, IconUserPlus, IconUsers } from "@tabler/icons-react";
import { Result } from "better-result";
import { ConvexError } from "convex/values";

import { getFieldError } from "~/features/auth/components/field-error";
import { SignupSchema } from "~/features/auth/schemas/signup-schema";
import { AuthError } from "~/features/auth/types/auth-error";

export function SignupForm() {
  const { signIn } = useAuthActions();
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
          try: () =>
            signIn("password", {
              displayName: output.displayName,
              email: output.email,
              flow: "signUp",
              password: output.password,
              role: output.role,
            }),
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
              leftSection={<IconMail size={16} />}
              placeholder="you@example.com"
              required
              type="email"
              value={field.input}
              disabled={form.isSubmitting}
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
              leftSection={<IconUser size={16} />}
              placeholder="John Doe"
              required
              value={field.input}
              disabled={form.isSubmitting}
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
              leftSection={<IconUsers size={16} />}
              onChange={(value) =>
                field.onChange((value ?? undefined) as "partner" | "self" | undefined)
              }
              placeholder="選択してください"
              value={field.input ?? null}
              disabled={form.isSubmitting}
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
              leftSection={<IconLock size={16} />}
              placeholder="12文字以上・英大小文字+数字"
              required
              value={field.input}
              disabled={form.isSubmitting}
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
              leftSection={<IconLock size={16} />}
              placeholder="もう一度入力"
              required
              value={field.input}
              disabled={form.isSubmitting}
            />
          )}
        </Field>
        <Button
          fullWidth
          leftSection={<IconUserPlus size={18} />}
          loading={form.isSubmitting}
          disabled={form.isSubmitting}
          type="submit"
        >
          アカウント作成
        </Button>
      </Stack>
    </Form>
  );
}
