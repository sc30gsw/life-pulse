import { Avatar, Badge, Box, Button, EmptyState, Group, Paper, Stack, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { IconDog, IconSettings } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { cn } from "cnfast";

import { GlowCard } from "~/components/glow-card";
import { DogCareRow } from "~/features/dashboard/components/dog-care-row";
import { DogHistoryButton } from "~/features/dashboard/components/dog-history-modal";
import { useDashboardDog } from "~/features/dashboard/hooks/use-dashboard-dog";
import { DOG_PROFILE_COPY, DOG_TASK_COPY } from "~/features/dog/constants/dog-profile";
import { ACCENT_CLASSES, ACCENT_SOLID_STYLE, ACCENT_VARS } from "~/types/dashboard";

export function DogCard() {
  const { dogCare, dogFlashRef, dogImageUrl, dogName, hasDog, onToggleDogCare } = useDashboardDog();
  const pendingCount = dogCare.filter((item) => !item.done).length;
  const pendingAccent = pendingCount > 0 ? ACCENT_CLASSES.coral : ACCENT_CLASSES.good;

  if (!hasDog) {
    return (
      <GlowCard
        className="bg-panel border-bd shadow-card relative flex flex-1 flex-col overflow-hidden border"
        p="lg"
        radius={18}
      >
        <EmptyState
          icon={<IconDog size={48} />}
          title={
            <Text size="xl" fw={600} c="coral">
              {DOG_PROFILE_COPY.missing.title}
            </Text>
          }
          description={DOG_PROFILE_COPY.missing.dashboardDescription}
        >
          <EmptyState.Actions>
            <Button
              className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
              component={Link}
              to="/dog"
              style={ACCENT_SOLID_STYLE.coral}
            >
              {DOG_PROFILE_COPY.navigation.manage}
            </Button>
          </EmptyState.Actions>
        </EmptyState>
      </GlowCard>
    );
  }
  const displayDogName = dogName ?? "";

  return (
    <GlowCard
      ref={dogFlashRef}
      className="bg-panel border-bd shadow-card relative flex flex-1 flex-col overflow-hidden border"
      p="lg"
      radius={18}
    >
      <Group justify="space-between" mb="md">
        <Group gap={11}>
          <Avatar
            alt={displayDogName}
            className={cn(ACCENT_CLASSES.coral.border, "border")}
            name={displayDogName}
            radius="md"
            size={34}
            src={dogImageUrl}
          />
          <Stack gap={0}>
            <Text size="sm" fw={600}>
              {displayDogName}
            </Text>
            <Text
              size="10.5px"
              fw={600}
              tt="uppercase"
              c={ACCENT_VARS.faint}
              style={{ letterSpacing: "0.13em" }}
            >
              {DOG_PROFILE_COPY.todayCare}
            </Text>
          </Stack>
        </Group>
        <Group gap={8}>
          <Badge
            variant="outline"
            className={cn(pendingAccent.border, pendingAccent.bg, pendingAccent.text)}
          >
            {pendingCount > 0
              ? DOG_TASK_COPY.dashboard.pendingCountLabel(pendingCount)
              : DOG_TASK_COPY.dashboard.allDoneLabel}
          </Badge>
          <DogHistoryButton />
          <Button
            aria-label={DOG_TASK_COPY.dashboard.manageAriaLabel}
            className="border-bd-2 text-tx transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
            component={Link}
            leftSection={<IconSettings size={14} />}
            size="xs"
            to="/dog"
            type="button"
            variant="outline"
          >
            {DOG_TASK_COPY.dashboard.manageLabel}
          </Button>
        </Group>
      </Group>

      <Stack gap={8}>
        {dogCare.map((item) => (
          <DogCareRow item={item} key={item.taskId} onToggle={onToggleDogCare} />
        ))}
      </Stack>
    </GlowCard>
  );
}

export function DogCardFallback() {
  return (
    <Shimmer loading>
      <Paper
        className="bg-panel border-bd shadow-card relative flex flex-1 flex-col overflow-hidden border"
        p="lg"
        radius={18}
      >
        <Group justify="space-between" mb="md">
          <Group gap={11}>
            <Avatar
              alt={DOG_PROFILE_COPY.fallbackName}
              className="border-coral border"
              name={DOG_PROFILE_COPY.fallbackName}
              radius="xl"
              size={34}
            />
            <Stack gap={0}>
              <Text size="sm" fw={600}>
                {DOG_PROFILE_COPY.fallbackName}
              </Text>
              <Text size="10.5px" fw={600} tt="uppercase" c={ACCENT_VARS.faint}>
                {DOG_PROFILE_COPY.todayCare}
              </Text>
            </Stack>
          </Group>
          <Badge variant="outline" className="border-coral bg-coral/16 text-coral">
            {DOG_TASK_COPY.dashboard.fallbackPendingLabel}
          </Badge>
        </Group>

        <Stack gap={8}>
          {DOG_TASK_COPY.dashboard.fallbackTaskNames.map((label) => (
            <Group
              key={label}
              className="border-bd bg-panel-2 rounded-xl border px-3.5 py-2.5"
              gap={12}
            >
              <Box className="border-coral h-5 w-5 rounded-full border-2" />
              <Text size="sm" fw={500}>
                {label}
              </Text>
              <Text size="xs" c="dimmed" className="ml-auto">
                {DOG_TASK_COPY.dashboard.incompleteLabel}
              </Text>
            </Group>
          ))}
        </Stack>
      </Paper>
    </Shimmer>
  );
}
