import { Group, Stack, Text } from "@mantine/core";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { valibotValidator } from "@tanstack/valibot-adapter";
import { Suspense, useEffect, useRef } from "react";

import { GlowCard } from "~/components/glow-card";
import { StudyCategoryManager } from "~/features/study-categories/components/study-category-manager";
import { BlockList, BlockListFallback } from "~/features/study/components/block-list";
import { DeclareBlockForm } from "~/features/study/components/declare-block-form";
import {
  SessionHistoryList,
  SessionHistoryListFallback,
} from "~/features/study/components/session-history-list";
import {
  UpcomingBlockList,
  UpcomingBlockListFallback,
} from "~/features/study/components/upcoming-block-list";
import {
  defaultStudySearchParams,
  studySearchSchema,
} from "~/features/study/schemas/study-search-schema";
import { ACCENT_VARS } from "~/types/dashboard";

export const Route = createFileRoute("/_authenticated/study")({
  component: StudyPage,
  validateSearch: valibotValidator(studySearchSchema),
  search: {
    middlewares: [stripSearchParams(defaultStudySearchParams)],
  },
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

function StudyPage() {
  const { focus } = Route.useSearch();
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focus === "categories") {
      categoriesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focus]);

  return (
    <>
      <Group component="header" wrap="wrap" gap="md" align="center" mb="lg">
        <Stack gap={0} mr="auto">
          <Text className="lp-brandtext" component="h1" fw={700} size="lg" m={0}>
            学習管理
          </Text>
          <Text
            size="10.5px"
            fw={600}
            tt="uppercase"
            c={ACCENT_VARS.faint}
            style={{ letterSpacing: "0.13em" }}
          >
            Study Blocks & Sessions
          </Text>
        </Stack>
      </Group>

      <main className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <section className="flex min-w-0 flex-1 flex-col gap-4">
          <GlowCard
            ref={categoriesRef}
            className="bg-panel border-bd shadow-card relative overflow-hidden border"
            p="lg"
            radius={18}
          >
            <SectionLabel label="カテゴリ管理" />
            <Suspense
              fallback={
                <Text c="dimmed" size="sm">
                  カテゴリを読み込み中...
                </Text>
              }
            >
              <StudyCategoryManager />
            </Suspense>
          </GlowCard>

          <GlowCard
            className="bg-panel border-bd shadow-card relative overflow-hidden border"
            p="lg"
            radius={18}
          >
            <SectionLabel label="枠の宣言" />
            <DeclareBlockForm />
          </GlowCard>

          <GlowCard
            className="bg-panel border-bd shadow-card relative overflow-hidden border"
            p="lg"
            radius={18}
          >
            <SectionLabel label="今日の枠" />
            <Suspense fallback={<BlockListFallback />}>
              <BlockList />
            </Suspense>
          </GlowCard>

          <GlowCard
            className="bg-panel border-bd shadow-card relative overflow-hidden border"
            p="lg"
            radius={18}
          >
            <SectionLabel label="予定" />
            <Suspense fallback={<UpcomingBlockListFallback />}>
              <UpcomingBlockList />
            </Suspense>
          </GlowCard>
        </section>

        <section className="flex min-w-0 flex-1 flex-col gap-4">
          <GlowCard
            className="bg-panel border-bd shadow-card relative overflow-hidden border"
            p="lg"
            radius={18}
          >
            <SectionLabel label="セッション履歴(直近7日)" />
            <Suspense fallback={<SessionHistoryListFallback />}>
              <SessionHistoryList />
            </Suspense>
          </GlowCard>
        </section>
      </main>
    </>
  );
}
