import { Button, Group, Text } from "@mantine/core";
import { Suspense, useState } from "react";

import { HiitLogModal, type HiitLogModalTarget } from "~/features/health/components/hiit-log-modal";
import { HiitTrend, HiitTrendFallback } from "~/features/health/components/hiit-trend";
import { WorkoutList, WorkoutListFallback } from "~/features/health/components/workout-list";
import { ACCENT_SOLID_STYLE, ACCENT_VARS } from "~/types/dashboard";

export function HiitSection() {
  const [target, setTarget] = useState<HiitLogModalTarget>(null);

  return (
    <>
      <HiitLogModal onClose={() => setTarget(null)} target={target} />

      <Group justify="space-between" mb="md">
        <Text
          c={ACCENT_VARS.faint}
          fw={600}
          size="10.5px"
          style={{ letterSpacing: "0.13em" }}
          tt="uppercase"
        >
          直近28日間の記録
        </Text>
        <Button
          className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
          onClick={() => setTarget("new")}
          size="xs"
          style={ACCENT_SOLID_STYLE.good}
        >
          記録
        </Button>
      </Group>

      <Suspense fallback={<HiitTrendFallback />}>
        <HiitTrend />
      </Suspense>

      <Suspense fallback={<WorkoutListFallback />}>
        <WorkoutList onEdit={setTarget} />
      </Suspense>
    </>
  );
}
