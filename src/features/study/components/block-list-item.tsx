import {
  Badge,
  Box,
  Button,
  Chip,
  Grid,
  Group,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { cn } from "cnfast";
import type { ComponentProps } from "react";

import type { Doc } from "~/../convex/_generated/dataModel";
import { STUDY_BLOCK_LIST_COPY } from "~/features/study/constants/block-list";
import {
  ACCENT_CLASSES,
  ACCENT_SOLID_STYLE,
  ACCENT_VARS,
  CATEGORY_LABELS,
  DECLARATION_STATUS_LABELS,
  EROSION_REASON_LABELS,
  type DeclarationStatus,
  type ErosionReason,
  type SessionCategory,
} from "~/types/dashboard";

const STATUS_ACCENT = {
  declined: "blue",
  done: "good",
  eroded: "coral",
  planned: "faint",
  rescheduled: "violet",
} as const satisfies Record<DeclarationStatus, keyof typeof ACCENT_VARS>;

const EROSION_REASONS = Object.keys(EROSION_REASON_LABELS) as ErosionReason[];

const TOOLTIP_STYLES = {
  tooltip: {
    backgroundColor: "var(--panel2)",
    border: "1px solid var(--bd2)",
    color: "var(--tx)",
    fontSize: "11px",
  },
} as const satisfies ComponentProps<typeof Tooltip>["styles"];

type BlockListItemProps = {
  block: Doc<"studyBlocks">;
  erodingBlockId: Doc<"studyBlocks">["_id"] | null;
  onDecline: (block: Doc<"studyBlocks">) => void;
  onErode: (blockId: Doc<"studyBlocks">["_id"], reason: ErosionReason) => void;
  onReschedule: (block: Doc<"studyBlocks">, slot: string) => void;
  onStartFromBlock: (block: Doc<"studyBlocks">) => void;
  onToggleErosion: (blockId: Doc<"studyBlocks">["_id"]) => void;
  onUndoDecline: (blockId: Doc<"studyBlocks">["_id"]) => void;
  suggestions: string[];
};

export function BlockListItem({
  block,
  erodingBlockId,
  onDecline,
  onErode,
  onReschedule,
  onStartFromBlock,
  onToggleErosion,
  onUndoDecline,
  suggestions,
}: BlockListItemProps) {
  const accent = STATUS_ACCENT[block.status];

  return (
    <Box className="border-bd bg-panel-2 rounded-xl border px-3.5 py-2.5">
      <Group gap={8} wrap="wrap">
        <Text className="tabular-nums" size="sm" fw={600}>
          {block.startHm}〜{block.endHm}
        </Text>
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
        <Badge
          className={cn(
            ACCENT_CLASSES[accent].border,
            ACCENT_CLASSES[accent].bg,
            ACCENT_CLASSES[accent].text,
            "ml-auto border",
          )}
          size="sm"
          variant="outline"
        >
          {DECLARATION_STATUS_LABELS[block.status]}
        </Badge>
      </Group>

      {block.status === "planned" ? (
        <PlannedBlockActions
          block={block}
          erodingBlockId={erodingBlockId}
          onErode={onErode}
          onStartFromBlock={onStartFromBlock}
          onToggleErosion={onToggleErosion}
        />
      ) : null}

      {block.status === "eroded" ? (
        <ErodedBlockActions
          block={block}
          onDecline={onDecline}
          onReschedule={onReschedule}
          suggestions={suggestions}
        />
      ) : null}

      {block.status === "declined" ? (
        <DeclinedBlockActions block={block} onUndoDecline={onUndoDecline} />
      ) : null}
    </Box>
  );
}

type PlannedBlockActionsProps = Pick<
  BlockListItemProps,
  "block" | "erodingBlockId" | "onErode" | "onStartFromBlock" | "onToggleErosion"
>;

function PlannedBlockActions({
  block,
  erodingBlockId,
  onErode,
  onStartFromBlock,
  onToggleErosion,
}: PlannedBlockActionsProps) {
  return (
    <Group gap={8} mt={10} wrap="wrap">
      <Button
        onClick={() => onStartFromBlock(block)}
        size="xs"
        style={ACCENT_SOLID_STYLE.good}
        type="button"
        variant="filled"
        className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
      >
        この枠で開始
      </Button>
      <Tooltip label={STUDY_BLOCK_LIST_COPY.erodeTooltip} styles={TOOLTIP_STYLES}>
        <Button
          className={cn(
            ACCENT_CLASSES.coral.border,
            ACCENT_CLASSES.coral.text,
            "hover:bg-coral hover:text-bg focus-visible:bg-coral focus-visible:text-bg transition hover:brightness-110 active:brightness-95",
          )}
          onClick={() => onToggleErosion(block._id)}
          size="xs"
          type="button"
          variant="outline"
        >
          侵食
        </Button>
      </Tooltip>
      {erodingBlockId === block._id ? (
        <>
          <Text c={ACCENT_VARS.faint} size="xs">
            理由:
          </Text>
          {EROSION_REASONS.map((reason) => (
            <UnstyledButton
              className={cn(
                ACCENT_CLASSES.coral.border,
                "bg-inset text-dim rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:brightness-110 active:brightness-95",
              )}
              key={reason}
              onClick={() => onErode(block._id, reason)}
              type="button"
            >
              {EROSION_REASON_LABELS[reason]}
            </UnstyledButton>
          ))}
        </>
      ) : null}
    </Group>
  );
}

type ErodedBlockActionsProps = Pick<
  BlockListItemProps,
  "block" | "onDecline" | "onReschedule" | "suggestions"
>;

function ErodedBlockActions({
  block,
  onDecline,
  onReschedule,
  suggestions,
}: ErodedBlockActionsProps) {
  return (
    <Grid align="center" mt={10}>
      <Grid.Col span={12}>
        <Chip
          classNames={{
            label: cn(
              "border px-3 py-1.5 text-xs",
              ACCENT_CLASSES.coral.border,
              ACCENT_CLASSES.coral.bg,
              ACCENT_CLASSES.coral.text,
              "font-semibold",
            ),
          }}
        >
          侵食
          {block.erosionReason !== undefined
            ? `(${EROSION_REASON_LABELS[block.erosionReason]})`
            : ""}{" "}
          · リスケ候補:
        </Chip>
      </Grid.Col>
      {suggestions.length === 0 ? (
        <Grid.Col span="content">
          <Text c="dimmed" size="xs">
            本日の空き枠なし
          </Text>
        </Grid.Col>
      ) : (
        suggestions.map((slot) => (
          <Grid.Col key={slot} span={2.35}>
            <UnstyledButton
              className={cn(
                ACCENT_CLASSES.violet.border,
                ACCENT_CLASSES.violet.bg,
                ACCENT_CLASSES.violet.text,
                "rounded-lg border px-3 py-1.5 text-xs font-semibold tabular-nums transition hover:brightness-110 active:brightness-95",
              )}
              onClick={() => onReschedule(block, slot)}
              type="button"
            >
              {slot}〜
            </UnstyledButton>
          </Grid.Col>
        ))
      )}
      <Grid.Col span={12}>
        <Button
          className={cn(
            ACCENT_CLASSES.faint.border,
            ACCENT_CLASSES.faint.text,
            "hover:bg-inset w-full transition hover:brightness-110 active:brightness-95",
          )}
          onClick={() => onDecline(block)}
          size="xs"
          type="button"
          variant="outline"
        >
          リスケしない
        </Button>
      </Grid.Col>
    </Grid>
  );
}

type DeclinedBlockActionsProps = Pick<BlockListItemProps, "block" | "onUndoDecline">;

function DeclinedBlockActions({ block, onUndoDecline }: DeclinedBlockActionsProps) {
  return (
    <Group gap={8} mt={10} wrap="wrap">
      <Text c={ACCENT_VARS.blue} size="xs">
        リスケしないを選択しました
      </Text>
      <UnstyledButton
        className={cn(
          ACCENT_CLASSES.blue.border,
          "bg-inset text-dim rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:brightness-110 active:brightness-95",
        )}
        onClick={() => onUndoDecline(block._id)}
        type="button"
      >
        元に戻す
      </UnstyledButton>
    </Group>
  );
}
