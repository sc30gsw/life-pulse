import { Button, Chip, EmptyState, Group, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconBarbell } from "@tabler/icons-react";
import { cn } from "cnfast";
import type { ComponentProps } from "react";

import type { Doc } from "~/../convex/_generated/dataModel";
import type { EditableWorkout } from "~/features/health/components/hiit-log-form";
import { useDeleteWorkout } from "~/features/health/hooks/use-delete-workout";
import { useWorkouts } from "~/features/health/hooks/use-workouts";
import { ACCENT_CLASSES, ACCENT_SOLID_STYLE, WORKOUT_KIND_LABELS } from "~/types/dashboard";
import { dayjs } from "~/utils/dayjs";

const CONFIRM_MODAL_STYLES = {
  body: { color: "var(--tx)" },
  content: { backgroundColor: "var(--panel)", border: "1px solid var(--bd2)", color: "var(--tx)" },
  header: { backgroundColor: "var(--panel)", color: "var(--tx)" },
  title: { color: "var(--tx)", fontWeight: 700 },
} as const satisfies ComponentProps<typeof modals.openConfirmModal>["styles"];

function formatAt(at: Doc<"workouts">["at"]) {
  return dayjs(at).tz("Asia/Tokyo").format("M/D HH:mm");
}

export function WorkoutList({ onEdit }: Record<"onEdit", (workout: EditableWorkout) => void>) {
  const { data: workouts } = useWorkouts();
  const deleteWorkout = useDeleteWorkout();

  if (workouts.length === 0) {
    return (
      <EmptyState
        description="直近28日間のHIIT記録がありません"
        icon={<IconBarbell size={48} />}
        title={
          <Text c="blue" fw={600} size="xl">
            記録はまだありません
          </Text>
        }
      />
    );
  }

  function onDelete(workout: EditableWorkout) {
    modals.openConfirmModal({
      cancelProps: { className: "border-bd bg-inset text-tx hover:bg-panel-2" },
      centered: true,
      children: <Text size="sm">この記録を削除します。元に戻せません。</Text>,
      confirmProps: { style: ACCENT_SOLID_STYLE.coral },
      labels: { cancel: "キャンセル", confirm: "削除する" },
      onConfirm: () => {
        deleteWorkout.mutate({ workoutId: workout._id });
      },
      styles: CONFIRM_MODAL_STYLES,
      title: "記録を削除しますか?",
    });
  }

  return (
    <Stack gap={8}>
      {workouts.map((workout) => (
        <Group
          className="border-bd bg-panel-2 rounded-xl border px-3.5 py-2.5"
          gap={8}
          key={workout._id}
          wrap="wrap"
        >
          <Chip
            classNames={{
              label: cn(
                "rounded-lg border px-3 py-1.5 text-xs",
                ACCENT_CLASSES.good.border,
                ACCENT_CLASSES.good.bg,
                ACCENT_CLASSES.good.text,
                "font-semibold",
              ),
            }}
          >
            {WORKOUT_KIND_LABELS[workout.kind]}
          </Chip>
          <Text className="tabular-nums" fw={600} size="sm">
            {formatAt(workout.at)}
          </Text>
          <Text c="dimmed" className="tabular-nums" size="xs">
            {workout.durationMinutes}分
          </Text>
          {workout.perceivedIntensity !== undefined && (
            <Text c="dimmed" className="tabular-nums" size="xs">
              強度 {workout.perceivedIntensity}
            </Text>
          )}
          <Group gap={6} ml="auto">
            <Button onClick={() => onEdit(workout)} size="xs" variant="outline">
              編集
            </Button>
            <Button color="red" onClick={() => onDelete(workout)} size="xs" variant="outline">
              削除
            </Button>
          </Group>
        </Group>
      ))}
    </Stack>
  );
}

export function WorkoutListFallback() {
  return (
    <Shimmer loading>
      <Stack gap={8}>
        {[0, 1].map((index) => (
          <Group
            className="border-bd bg-panel-2 rounded-xl border px-3.5 py-2.5"
            gap={8}
            key={index}
          >
            <Chip
              classNames={{
                label: cn(
                  "rounded-lg border px-3 py-1.5 text-xs",
                  ACCENT_CLASSES.good.border,
                  ACCENT_CLASSES.good.bg,
                  ACCENT_CLASSES.good.text,
                  "font-semibold",
                ),
              }}
            >
              HIIT
            </Chip>
            <Text className="tabular-nums" fw={600} size="sm">
              7/{index + 1} 20:00
            </Text>
            <Text c="dimmed" className="tabular-nums" size="xs">
              30分
            </Text>
          </Group>
        ))}
      </Stack>
    </Shimmer>
  );
}
