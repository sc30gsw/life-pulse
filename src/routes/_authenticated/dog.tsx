import { Group, Stack, Text } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { GlowCard } from "~/components/glow-card";
import { AddDogTaskForm } from "~/features/dog/components/add-dog-task-form";
import {
  DogImageUploader,
  DogImageUploaderFallback,
} from "~/features/dog/components/dog-image-uploader";
import { DogNameForm, DogNameFormFallback } from "~/features/dog/components/dog-name-form";
import { DogTaskList, DogTaskListFallback } from "~/features/dog/components/dog-task-list";
import { ACCENT_VARS } from "~/types/dashboard";

export const Route = createFileRoute("/_authenticated/dog")({
  component: DogPage,
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

function DogPage() {
  return (
    <>
      <Group component="header" wrap="wrap" gap="md" align="center" mb="lg">
        <Stack gap={0} mr="auto">
          <Text className="lp-brandtext" component="h1" fw={700} size="lg" m={0}>
            犬の管理
          </Text>
          <Text
            size="10.5px"
            fw={600}
            tt="uppercase"
            c={ACCENT_VARS.faint}
            style={{ letterSpacing: "0.13em" }}
          >
            Dog Profile & Care Tasks
          </Text>
        </Stack>
      </Group>

      <main className="flex min-w-0 flex-col gap-4">
        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          <GlowCard
            className="bg-panel border-bd shadow-card relative overflow-hidden border"
            p="lg"
            radius={18}
          >
            <SectionLabel label="犬の名前" />
            <Suspense fallback={<DogNameFormFallback />}>
              <DogNameForm />
            </Suspense>
          </GlowCard>

          <GlowCard
            className="bg-panel border-bd shadow-card relative overflow-hidden border"
            p="lg"
            radius={18}
          >
            <SectionLabel label="犬の写真" />
            <Suspense fallback={<DogImageUploaderFallback />}>
              <DogImageUploader />
            </Suspense>
          </GlowCard>
        </div>

        <GlowCard
          className="bg-panel border-bd shadow-card relative overflow-hidden border"
          p="lg"
          radius={18}
        >
          <SectionLabel label="お世話タスク管理" />
          <Stack gap="md">
            <AddDogTaskForm />
            <Suspense fallback={<DogTaskListFallback />}>
              <DogTaskList />
            </Suspense>
          </Stack>
        </GlowCard>
      </main>
    </>
  );
}
