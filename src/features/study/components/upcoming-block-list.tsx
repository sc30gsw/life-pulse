import { Badge, Box, Button, Chip, EmptyState, Group, Stack, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconCalendar } from "@tabler/icons-react";
import { cn } from "cnfast";
import { useState } from "react";

import type { Doc } from "~/../convex/_generated/dataModel";
import { EditBlockModal } from "~/features/study/components/edit-block-modal";
import { useUpcomingBlocks } from "~/features/study/hooks/use-upcoming-blocks";
import {
  ACCENT_CLASSES,
  ACCENT_VARS,
  CATEGORY_LABELS,
  type SessionCategory,
} from "~/types/dashboard";
import { holidayName } from "~/utils/holiday";

export function UpcomingBlockList() {
  const { blocks, onCancel } = useUpcomingBlocks();
  const [editingBlock, setEditingBlock] = useState<Doc<"studyBlocks"> | null>(null);

  if (blocks.length === 0) {
    return (
      <EmptyState
        icon={<IconCalendar size={48} />}
        title={
          <Text size="xl" fw={600} c="blue">
            予定枠はまだありません
          </Text>
        }
        description="予定枠がありません"
      />
    );
  }

  return (
    <>
      <Stack gap={8}>
        {blocks.map((block) => {
          const holiday = holidayName(block.dateJst);

          return (
            <Box className="border-bd bg-panel-2 rounded-xl border px-3.5 py-2.5" key={block._id}>
              <Group gap={8} wrap="wrap">
                <Text className="tabular-nums" size="sm" fw={600}>
                  {block.dateJst} {block.startHm}〜{block.endHm}
                </Text>
                {holiday !== null && (
                  <Badge
                    className={cn(
                      ACCENT_CLASSES.coral.border,
                      ACCENT_CLASSES.coral.bg,
                      ACCENT_CLASSES.coral.text,
                      "border",
                    )}
                    size="sm"
                    variant="outline"
                  >
                    {holiday}
                  </Badge>
                )}
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
                  {CATEGORY_LABELS[block.category as SessionCategory]}
                </Chip>
                <Text c="dimmed" size="xs">
                  {block.plannedMinutes}分
                </Text>
              </Group>

              <Group gap={8} mt={10} wrap="wrap">
                <Button
                  className={cn(
                    ACCENT_CLASSES.good.border,
                    ACCENT_CLASSES.good.text,
                    "transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100",
                  )}
                  onClick={() => setEditingBlock(block)}
                  size="xs"
                  type="button"
                  variant="outline"
                >
                  編集
                </Button>
                <Button
                  className={cn(
                    ACCENT_CLASSES.coral.border,
                    ACCENT_CLASSES.coral.text,
                    "transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100",
                  )}
                  onClick={() => onCancel(block)}
                  size="xs"
                  type="button"
                  variant="outline"
                >
                  キャンセル
                </Button>
              </Group>
            </Box>
          );
        })}
      </Stack>
      <EditBlockModal block={editingBlock} onClose={() => setEditingBlock(null)} />
    </>
  );
}

export function UpcomingBlockListFallback() {
  return (
    <Shimmer loading>
      <Stack gap={8}>
        {[0, 1].map((index) => (
          <Box className="border-bd bg-panel-2 rounded-xl border px-3.5 py-2.5" key={index}>
            <Group gap={8}>
              <Text className="tabular-nums" size="sm" fw={600}>
                2026-07-08 06:00〜07:00
              </Text>
              <Text c={ACCENT_VARS.faint} size="sm">
                TOEIC
              </Text>
            </Group>
          </Box>
        ))}
      </Stack>
    </Shimmer>
  );
}
