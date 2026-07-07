import { Group, Stack, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { GlowCard } from "~/components/glow-card";
import {
  DemoModeSwitch,
  DemoModeSwitchFallback,
} from "~/features/settings/components/demo-mode-switch";
import { SettingsForm, SettingsFormFallback } from "~/features/settings/components/settings-form";
import { ACCENT_VARS } from "~/types/dashboard";

export const Route = createFileRoute("/_authenticated/_self/settings")({
  component: SettingsPage,
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

function SettingsPage() {
  return (
    <div className="min-h-dvh px-4 py-5 pb-16 sm:px-8 sm:py-6">
      <Group component="header" wrap="wrap" gap="md" align="center" mb="lg">
        <Stack gap={0} mr="auto">
          <Text className="lp-brandtext" component="h1" fw={700} size="lg" m={0}>
            設定
          </Text>
          <Text
            size="10.5px"
            fw={600}
            tt="uppercase"
            c={ACCENT_VARS.faint}
            style={{ letterSpacing: "0.13em" }}
          >
            Settings
          </Text>
        </Stack>
        <Link to="/" className="flex items-center gap-2 text-sm text-blue-500 hover:brightness-120">
          <IconArrowLeft size={16} /> ライブボード
        </Link>
      </Group>

      <main className="flex flex-col gap-4">
        <GlowCard
          className="bg-panel border-bd shadow-card relative overflow-hidden border"
          p="lg"
          radius={18}
        >
          <SectionLabel label="デモモード" />
          <Suspense fallback={<DemoModeSwitchFallback />}>
            <DemoModeSwitch />
          </Suspense>
        </GlowCard>

        <GlowCard
          className="bg-panel border-bd shadow-card relative overflow-hidden border"
          p="lg"
          radius={18}
        >
          <SectionLabel label="基本設定" />
          <Suspense fallback={<SettingsFormFallback />}>
            <SettingsForm />
          </Suspense>
        </GlowCard>
      </main>
    </div>
  );
}
