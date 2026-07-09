import { Center, Stack, Text, Title } from "@mantine/core";
import { Link, Navigate, createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { valibotValidator } from "@tanstack/valibot-adapter";
import { useConvexAuth } from "convex/react";

import { GlowCard } from "~/components/glow-card";
import { ResetPasswordForm } from "~/features/auth/components/reset-password-form";
import {
  ResetPasswordSearchSchema,
  defaultResetPasswordSearchParams,
} from "~/features/auth/schemas/password-reset-schema";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  validateSearch: valibotValidator(ResetPasswordSearchSchema),
  search: {
    middlewares: [stripSearchParams(defaultResetPasswordSearchParams)],
  },
});

function ResetPasswordPage() {
  const { isAuthenticated } = useConvexAuth();

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <Center className="bg-bg text-tx" mih="100dvh" p="md">
      <GlowCard
        className="border-bd bg-panel shadow-card relative w-full max-w-sm overflow-hidden border"
        p="xl"
        radius="lg"
      >
        <Stack gap="lg">
          <div>
            <Title className="font-mono" order={2} ta="center">
              Life Pulse
            </Title>
            <Text c="dimmed" mt="xs" ta="center" tt="uppercase">
              New Password
            </Text>
          </div>
          <ResetPasswordForm />
          <Text c="dimmed" size="sm" ta="center">
            <Link
              className="text-blue transition hover:brightness-110 active:brightness-95"
              to="/login"
            >
              ログインへ戻る
            </Link>
          </Text>
        </Stack>
      </GlowCard>
    </Center>
  );
}
