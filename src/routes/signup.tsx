import { Center, Paper, Stack, Text, Title } from "@mantine/core";
import { Link, createFileRoute } from "@tanstack/react-router";

import { SignupForm } from "~/features/auth/components/signup-form";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  return (
    <Center className="bg-bg text-tx" mih="100vh" p="md">
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
            <Link className="text-blue" to="/login">
              ログイン
            </Link>
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}
