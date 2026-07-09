import { Center, Stack, Text, Title } from "@mantine/core";
import { Navigate, createFileRoute } from "@tanstack/react-router";
import { useConvexAuth, useQuery } from "convex/react";

import { api } from "~/../convex/_generated/api";
import { GlowCard } from "~/components/glow-card";
import { PendingComponent } from "~/components/layouts/pending";
import { VerifyOtpForm } from "~/features/auth/components/verify-otp-form";

export const Route = createFileRoute("/verify-otp")({
  component: VerifyOtpPage,
});

function VerifyOtpPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const secondFactorStatus = useQuery(
    api.queries.auth.secondFactorStatus.secondFactorStatus,
    isAuthenticated ? {} : "skip",
  );

  if (isLoading || secondFactorStatus === undefined) {
    return <PendingComponent />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!secondFactorStatus.required || secondFactorStatus.verified) {
    return <Navigate to="/" />;
  }

  return (
    <Center className="bg-bg text-tx" mih="100dvh" p="md">
      <GlowCard
        className="border-bd bg-panel shadow-card relative w-full max-w-sm overflow-hidden border"
        p="xl"
        radius="lg"
      >
        <Stack gap="lg" align="center">
          <div>
            <Title className="font-mono" order={2} ta="center">
              Life Pulse
            </Title>
            <Text c="dimmed" mt="xs" ta="center" tt="uppercase">
              Email OTP
            </Text>
          </div>
          <VerifyOtpForm />
        </Stack>
      </GlowCard>
    </Center>
  );
}
