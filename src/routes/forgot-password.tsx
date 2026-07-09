import { Center, Stack, Text, Title } from "@mantine/core";
import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";

import { GlowCard } from "~/components/glow-card";
import { ForgotPasswordForm } from "~/features/auth/components/forgot-password-form";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
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
              Reset Password
            </Text>
          </div>
          <ForgotPasswordForm />
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
