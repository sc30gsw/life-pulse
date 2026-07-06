import { Badge, Box, Group, Paper, Stack, Text, UnstyledButton } from "@mantine/core";
import { cn } from "cnfast";

import {
  ACCENT_CLASSES,
  ACCENT_SOLID_STYLE,
  ACCENT_VARS,
  DOG_EVENT_LABELS,
  type DogCareItem,
  type DogEventKind,
} from "~/features/dashboard/types/dashboard";

type DogCardProps = {
  dogCare: DogCareItem[];
  dogFlash: boolean;
  dogName: string;
  onToggle: (kind: DogEventKind) => void;
};

export function DogCard({ dogCare, dogFlash, dogName, onToggle }: DogCardProps) {
  const pendingCount = dogCare.filter((item) => !item.done).length;
  const pendingAccent = pendingCount > 0 ? ACCENT_CLASSES.coral : ACCENT_CLASSES.good;

  return (
    <Paper
      className={cn(
        "bg-panel border-bd shadow-card relative flex flex-1 flex-col overflow-hidden border",
        dogFlash && "lp-flash",
      )}
      p="lg"
      radius={18}
    >
      <Group justify="space-between" mb="md">
        <Group gap={11}>
          <Box
            className={cn(
              "flex h-8.5 w-8.5 items-center justify-center rounded-lg border font-bold",
              ACCENT_CLASSES.coral.border,
              ACCENT_CLASSES.coral.bg,
              ACCENT_CLASSES.coral.text,
            )}
          >
            {dogName.slice(0, 1)}
          </Box>
          <Stack gap={0}>
            <Text size="sm" fw={600}>
              {dogName}
            </Text>
            <Text
              size="10.5px"
              fw={600}
              tt="uppercase"
              c={ACCENT_VARS.faint}
              style={{ letterSpacing: "0.13em" }}
            >
              トイプードル · 今日のケア
            </Text>
          </Stack>
        </Group>
        <Badge
          variant="outline"
          className={cn(pendingAccent.border, pendingAccent.bg, pendingAccent.text)}
        >
          {pendingCount > 0 ? `未実施 ${pendingCount} 件` : "すべて完了"}
        </Badge>
      </Group>

      <Stack gap={8}>
        {dogCare.map((item) => (
          <UnstyledButton
            key={item.kind}
            type="button"
            aria-pressed={item.done}
            onClick={() => onToggle(item.kind)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left",
              item.done
                ? "border-bd bg-panel-2"
                : cn(ACCENT_CLASSES.coral.border, ACCENT_CLASSES.coral.bg),
            )}
          >
            {item.done ? (
              <Box
                style={ACCENT_SOLID_STYLE.good}
                className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
              >
                ✓
              </Box>
            ) : (
              <Box className={cn(ACCENT_CLASSES.coral.border, "h-5 w-5 rounded-full border-2")} />
            )}
            <Text size="sm" fw={500} className="text-tx">
              {DOG_EVENT_LABELS[item.kind]}
            </Text>
            <Text size="xs" c="dimmed" className="ml-auto">
              {item.done ? (item.by === "self" ? "本人" : "妻") : "未"}
            </Text>
          </UnstyledButton>
        ))}
      </Stack>
    </Paper>
  );
}
