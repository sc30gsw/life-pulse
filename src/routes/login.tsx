import { Center, Paper, Stack, Text, Title } from "@mantine/core";
import { IconUserPlus } from "@tabler/icons-react";
import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";

import { LoginForm } from "~/features/auth/components/login-form";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated } = useConvexAuth();

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <Center className="bg-bg text-tx" mih="100dvh" p="md">
      <Paper className="border-bd bg-panel shadow-card w-full max-w-sm border" p="xl" radius="lg">
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
            アカウントをお持ちでない方は{" "}
            <Link className="text-blue inline-flex items-center gap-1" to="/signup">
              <IconUserPlus aria-hidden size={14} />
              サインアップ
            </Link>
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}
