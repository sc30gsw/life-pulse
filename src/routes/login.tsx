import { Center, Stack, Text, Title } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconUserPlus } from "@tabler/icons-react";
import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";

import { GlowCard } from "~/components/glow-card";
import { LoginForm } from "~/features/auth/components/login-form";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <Center className="bg-bg text-tx" mih="100dvh" p="md">
      <Shimmer loading={isLoading}>
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
                Login
              </Text>
            </div>
            <LoginForm />
            <Text c="dimmed" size="sm" ta="center">
              <Link
                className="text-blue inline-flex items-center gap-1 transition hover:brightness-110 active:brightness-95"
                to="/forgot-password"
              >
                パスワードを忘れた方
              </Link>
            </Text>
            <Text c="dimmed" size="sm" ta="center">
              アカウントをお持ちでない方は{" "}
              <Link
                className="text-blue inline-flex items-center gap-1 transition hover:brightness-110 active:brightness-95"
                to="/signup"
              >
                <IconUserPlus aria-hidden size={14} />
                サインアップ
              </Link>
            </Text>
          </Stack>
        </GlowCard>
      </Shimmer>
    </Center>
  );
}
