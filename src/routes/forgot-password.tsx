import { Field, Form, useForm } from "@formisch/react";
import { Button, Center, Stack, Text, TextInput, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconMail } from "@tabler/icons-react";
import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import { Result } from "better-result";
import { useAction, useConvexAuth } from "convex/react";
import { ConvexError } from "convex/values";

import { api } from "~/../convex/_generated/api";
import { GlowCard } from "~/components/glow-card";
import { ForgotPasswordSchema } from "~/features/auth/schemas/password-reset-schema";
import { AuthError } from "~/features/auth/types/auth-error";
import { getFieldError } from "~/utils/field-error";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { isAuthenticated } = useConvexAuth();
  const requestPasswordReset = useAction(
    api.actions.auth.requestPasswordReset.requestPasswordReset,
  );
  const form = useForm({
    initialInput: { email: "" },
    revalidate: "input",
    schema: ForgotPasswordSchema,
    validate: "blur",
  });

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  async function submit(output: { email: string }) {
    const result = await Result.tryPromise({
      catch: (cause) =>
        new AuthError({
          cause,
          message: cause instanceof ConvexError ? String(cause.data) : "送信に失敗しました",
        }),
      try: () => requestPasswordReset(output),
    });

    if (Result.isOk(result)) {
      notifications.show({
        color: "green",
        message: "登録済みの場合、再設定メールを送信しました",
        title: "送信完了",
      });

      return;
    }

    notifications.show({
      color: "red",
      message: result.error.message,
      title: "送信エラー",
    });
  }

  return (
    <Center className="bg-bg text-tx" mih="100dvh" p="md">
      <GlowCard
        className="border-bd bg-panel shadow-card relative w-full max-w-sm overflow-hidden border"
        p="xl"
        radius="lg"
      >
        <Form of={form} onSubmit={(output) => void submit(output)}>
          <Stack gap="lg">
            <div>
              <Title className="font-mono" order={2} ta="center">
                Life Pulse
              </Title>
              <Text c="dimmed" mt="xs" ta="center" tt="uppercase">
                Reset Password
              </Text>
            </div>
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
            <Button
              fullWidth
              loading={form.isSubmitting}
              disabled={form.isSubmitting}
              type="submit"
            >
              再設定メールを送信
            </Button>
            <Text c="dimmed" size="sm" ta="center">
              <Link
                className="text-blue transition hover:brightness-110 active:brightness-95"
                to="/login"
              >
                ログインへ戻る
              </Link>
            </Text>
          </Stack>
        </Form>
      </GlowCard>
    </Center>
  );
}
