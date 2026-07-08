import { Box, Text, UnstyledButton } from "@mantine/core";
import { cn } from "cnfast";

import type { useDashboardDog } from "~/features/dashboard/hooks/use-dashboard-dog";
import { ACCENT_CLASSES, ACCENT_SOLID_STYLE } from "~/types/dashboard";

type DogCareRowProps = {
  item: ReturnType<typeof useDashboardDog>["dogCare"][number];
  onToggle: ReturnType<typeof useDashboardDog>["onToggleDogCare"];
};

export function DogCareRow({ item, onToggle }: DogCareRowProps) {
  return (
    <UnstyledButton
      type="button"
      aria-pressed={item.done}
      onClick={() => onToggle(item.taskId)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left",
        "transition hover:brightness-110 active:brightness-95",
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
        {item.name}
      </Text>
      <Text size="xs" c="dimmed" className="ml-auto">
        {item.done ? (item.by === "self" ? "本人" : "パートナー") : "未"}
      </Text>
    </UnstyledButton>
  );
}
