import { Center, Paper, Stack, Text, Title } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconLogin2 } from "@tabler/icons-react";
import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";

import { SignupForm } from "~/features/auth/components/signup-form";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <Center className="bg-bg text-tx" mih="100dvh" p="md">
      <Shimmer loading={isLoading}>
        <Paper className="border-bd bg-panel shadow-card w-full max-w-sm border" p="xl" radius="lg">
          <Stack gap="lg">
            <div>
              <Title className="font-mono" order={2} ta="center">
                Life Pulse
              </Title>
              <Text c="dimmed" mt="xs" ta="center" tt="uppercase">
                Sign up
              </Text>
            </div>
            <SignupForm />
            <Text c="dimmed" size="sm" ta="center">
              アカウントをお持ちの方は{" "}
              <Link className="text-blue inline-flex items-center gap-1" to="/login">
                <IconLogin2 aria-hidden size={14} />
                ログイン
              </Link>
            </Text>
          </Stack>
        </Paper>
      </Shimmer>
    </Center>
  );
}
