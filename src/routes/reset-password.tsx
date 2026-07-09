import { Field, Form, useForm } from "@formisch/react";
import { Button, Center, PasswordInput, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconLock } from "@tabler/icons-react";
import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import { Result } from "better-result";
import { useAction, useConvexAuth } from "convex/react";
import type { FunctionArgs } from "convex/server";
import { ConvexError } from "convex/values";

import { api } from "~/../convex/_generated/api";
import { GlowCard } from "~/components/glow-card";
import { ResetPasswordSchema } from "~/features/auth/schemas/password-reset-schema";
import { AuthError } from "~/features/auth/types/auth-error";
import { getFieldError } from "~/utils/field-error";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  validateSearch: (search) => ({ token: typeof search.token === "string" ? search.token : "" }),
});

function ResetPasswordPage() {
  const { isAuthenticated } = useConvexAuth();
  const { token } = Route.useSearch();
  const resetPassword = useAction(api.actions.auth.resetPassword.resetPassword);
  const form = useForm({
    initialInput: { confirmPassword: "", newPassword: "" },
    revalidate: "input",
    schema: ResetPasswordSchema,
    validate: "blur",
  });

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  async function submit(
    output: Pick<FunctionArgs<typeof api.actions.auth.resetPassword.resetPassword>, "newPassword">,
  ) {
    const result = await Result.tryPromise({
      catch: (cause) =>
        new AuthError({
          cause,
          message: cause instanceof ConvexError ? String(cause.data) : "更新に失敗しました",
        }),
      try: () => resetPassword({ newPassword: output.newPassword, token }),
    });

    if (Result.isOk(result)) {
      notifications.show({
        color: "green",
        message: "パスワードを更新しました",
        title: "更新完了",
      });

      return;
    }

    notifications.show({
      color: "red",
      message: result.error.message,
      title: "更新エラー",
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
                New Password
              </Text>
            </div>
            <Field of={form} path={["newPassword"]}>
              {(field) => (
                <PasswordInput
                  {...field.props}
                  autoComplete="new-password"
                  error={getFieldError(field, form.isSubmitted)}
                  label="新しいパスワード"
                  leftSection={<IconLock size={16} />}
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
                  label="新しいパスワード(確認)"
                  leftSection={<IconLock size={16} />}
                  required
                  value={field.input}
                  disabled={form.isSubmitting}
                />
              )}
            </Field>
            <Button
              fullWidth
              loading={form.isSubmitting}
              disabled={form.isSubmitting || token.length === 0}
              type="submit"
            >
              パスワードを更新
            </Button>
            <Text c="dimmed" size="sm" ta="center">
              <Link
                disabled={form.isSubmitting}
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
