import { Group, Stack, Text } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { GlowCard } from "~/components/glow-card";
import {
  FastingHistoryList,
  FastingHistoryListFallback,
} from "~/features/fasting/components/fasting-history-list";
import {
  FastingStatusCard,
  FastingStatusCardFallback,
} from "~/features/fasting/components/fasting-status-card";
import { ACCENT_VARS } from "~/types/dashboard";

export const Route = createFileRoute("/_authenticated/fasting")({
  component: FastingPage,
});

function SectionLabel({ label }: Record<"label", string>) {
  return (
    <Text
      component="h2"
      size="11px"
      fw={600}
      tt="uppercase"
      c={ACCENT_VARS.faint}
      style={{ letterSpacing: "0.14em" }}
      m={0}
      mb="md"
    >
      {label}
    </Text>
  );
}

function FastingPage() {
  return (
    <>
      <Group component="header" wrap="wrap" gap="md" align="center" mb="lg">
        <Stack gap={0} mr="auto">
          <Text className="lp-brandtext" component="h1" fw={700} size="lg" m={0}>
            断食管理
          </Text>
          <Text
            size="10.5px"
            fw={600}
            tt="uppercase"
            c={ACCENT_VARS.faint}
            style={{ letterSpacing: "0.13em" }}
          >
            Fasting Window & History
          </Text>
        </Stack>
      </Group>

      <main className="flex flex-col gap-4">
        <GlowCard
          className="bg-panel border-bd shadow-card relative overflow-hidden border"
          p="lg"
          radius={18}
        >
          <SectionLabel label="現在の状態" />
          <Suspense fallback={<FastingStatusCardFallback />}>
            <FastingStatusCard />
          </Suspense>
        </GlowCard>

        <GlowCard
          className="bg-panel border-bd shadow-card relative overflow-hidden border"
          p="lg"
          radius={18}
        >
          <SectionLabel label="断食履歴(直近30件)" />
          <Suspense fallback={<FastingHistoryListFallback />}>
            <FastingHistoryList />
          </Suspense>
        </GlowCard>
      </main>
    </>
  );
}
