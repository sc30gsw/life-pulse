import { Box, Group, Paper, Stack, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";

export function PendingComponent() {
  return (
    <output
      aria-busy
      aria-label="読み込み中"
      className="block min-h-dvh px-4 py-5 pb-16 sm:px-8 sm:py-6"
    >
      <Shimmer loading>
        <Group align="center" gap="md" wrap="wrap">
          <Group data-shimmer-ignore gap={11} mr="auto">
            <Box className="bg-good lp-pulse h-2.5 w-2.5 rounded-full shadow-[0_0_12px_var(--good)]" />
            <Stack gap={0}>
              <Text fw={700} m={0} size="lg">
                Life Pulse
              </Text>
              <Text
                className="text-faint"
                fw={600}
                size="10.5px"
                style={{ letterSpacing: "0.13em" }}
                tt="uppercase"
              >
                Live Board
              </Text>
            </Stack>
          </Group>
          <Box className="bg-inset border-bd h-9 w-44 rounded-md border" />
          <Box className="bg-inset border-bd h-9 w-24 rounded-lg border" />
          <Box className="bg-inset border-bd h-9 w-9 rounded-md border" />
        </Group>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-stretch">
          <div className="flex min-w-0 flex-col gap-4 lg:flex-3">
            <Paper className="bg-panel border-bd shadow-card h-72 border" radius="md" />
            <Paper className="bg-panel border-bd shadow-card h-40 border" radius="md" />
          </div>
          <div className="flex min-w-0 flex-col gap-4 lg:flex-2">
            <Paper className="bg-panel border-bd shadow-card h-56 border" radius="md" />
            <Paper className="bg-panel border-bd shadow-card h-52 border" radius="md" />
          </div>
        </div>
      </Shimmer>
    </output>
  );
}
