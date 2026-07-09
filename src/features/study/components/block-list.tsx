import { Box, EmptyState, Group, Stack, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconClock } from "@tabler/icons-react";
import { useState } from "react";
import { sortBy } from "remeda";

import type { Doc } from "~/../convex/_generated/dataModel";
import { BlockListItem } from "~/features/study/components/block-list-item";
import { useStudyBlocks } from "~/features/study/hooks/use-study-blocks";

export function BlockList() {
  const { blocks, onDecline, onErode, onReschedule, onStartFromBlock, onUndoDecline, suggestions } =
    useStudyBlocks();
  const [erodingBlockId, setErodingBlockId] = useState<Doc<"studyBlocks">["_id"] | null>(null);

  if (blocks.length === 0) {
    return (
      <EmptyState
        icon={<IconClock size={48} />}
        title={
          <Text size="xl" fw={600} c="blue">
            今日の枠はまだ宣言されていません
          </Text>
        }
        description="今日の枠がありません"
      />
    );
  }

  return (
    <Stack gap={8}>
      {sortBy(blocks, (block) => block.startHm).map((block) => (
        <BlockListItem
          block={block}
          erodingBlockId={erodingBlockId}
          key={block._id}
          onDecline={onDecline}
          onErode={(blockId, reason) => {
            onErode(blockId, reason);
            setErodingBlockId(null);
          }}
          onReschedule={onReschedule}
          onStartFromBlock={onStartFromBlock}
          onToggleErosion={(blockId) =>
            setErodingBlockId((prev) => (prev === blockId ? null : blockId))
          }
          onUndoDecline={onUndoDecline}
          suggestions={suggestions}
        />
      ))}
    </Stack>
  );
}

export function BlockListFallback() {
  return (
    <Shimmer loading>
      <Stack gap={8}>
        {[0, 1].map((index) => (
          <Box className="border-bd bg-panel-2 rounded-xl border px-3.5 py-2.5" key={index}>
            <Group gap={8}>
              <Text className="tabular-nums" size="sm" fw={600}>
                06:00〜07:00
              </Text>
              <Text size="sm">TOEIC</Text>
              <Text c="dimmed" size="xs">
                60分
              </Text>
            </Group>
          </Box>
        ))}
      </Stack>
    </Shimmer>
  );
}
