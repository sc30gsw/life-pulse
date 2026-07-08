import { Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { GlowCard } from "~/components/glow-card";
import {
  BodyBatteryVsStudyScatter,
  BodyBatteryVsStudyScatterFallback,
} from "~/features/insights/components/body-battery-vs-study-scatter";
import {
  DailyCompositeChart,
  DailyCompositeChartFallback,
} from "~/features/insights/components/daily-composite-chart";
import {
  HiitBodyBatteryBarChart,
  HiitBodyBatteryBarChartFallback,
} from "~/features/insights/components/hiit-body-battery-bar-chart";
import {
  SleepVsStudyScatter,
  SleepVsStudyScatterFallback,
} from "~/features/insights/components/sleep-vs-study-scatter";
import {
  WorkoutKindPieChart,
  WorkoutKindPieChartFallback,
} from "~/features/insights/components/workout-kind-pie-chart";
import { ACCENT_VARS } from "~/types/dashboard";

export const Route = createFileRoute("/_authenticated/_self/insights")({
  component: InsightsPage,
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

function InsightsPage() {
  return (
    <div className="min-h-dvh px-4 py-5 pb-16 sm:px-8 sm:py-6">
      <Group component="header" wrap="wrap" gap="md" align="center" mb="lg">
        <Stack gap={0} mr="auto">
          <Text className="lp-brandtext" component="h1" fw={700} size="lg" m={0}>
            インサイト
          </Text>
          <Text
            size="10.5px"
            fw={600}
            tt="uppercase"
            c={ACCENT_VARS.faint}
            style={{ letterSpacing: "0.13em" }}
          >
            Health × Study Correlations · 直近28日
          </Text>
        </Stack>
      </Group>

      <main className="flex flex-col gap-4">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <GlowCard
            className="bg-panel border-bd shadow-card relative overflow-hidden border"
            p="lg"
            radius={18}
          >
            <SectionLabel label="睡眠スコア × 学習分数" />
            <Suspense fallback={<SleepVsStudyScatterFallback />}>
              <SleepVsStudyScatter />
            </Suspense>
          </GlowCard>

          <GlowCard
            className="bg-panel border-bd shadow-card relative overflow-hidden border"
            p="lg"
            radius={18}
          >
            <SectionLabel label="Body Battery × 学習分数" />
            <Suspense fallback={<BodyBatteryVsStudyScatterFallback />}>
              <BodyBatteryVsStudyScatter />
            </Suspense>
          </GlowCard>
        </SimpleGrid>

        <GlowCard
          className="bg-panel border-bd shadow-card relative overflow-hidden border"
          p="lg"
          radius={18}
        >
          <SectionLabel label="HIIT翌日効果" />
          <Suspense fallback={<HiitBodyBatteryBarChartFallback />}>
            <HiitBodyBatteryBarChart />
          </Suspense>
        </GlowCard>

        <GlowCard
          className="bg-panel border-bd shadow-card relative overflow-hidden border"
          p="lg"
          radius={18}
        >
          <SectionLabel label="日次推移" />
          <Suspense fallback={<DailyCompositeChartFallback />}>
            <DailyCompositeChart />
          </Suspense>
        </GlowCard>

        <GlowCard
          className="bg-panel border-bd shadow-card relative overflow-hidden border"
          p="lg"
          radius={18}
        >
          <SectionLabel label="トレーニング内訳" />
          <Suspense fallback={<WorkoutKindPieChartFallback />}>
            <WorkoutKindPieChart />
          </Suspense>
        </GlowCard>
      </main>
    </div>
  );
}
