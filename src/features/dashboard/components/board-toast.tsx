import { Box, Paper, Stack, Text } from "@mantine/core";

import { ACCENT_VARS, type BoardToast } from "~/features/dashboard/types/dashboard";

type BoardToastProps = {
  toasts: BoardToast[];
};

export function BoardToast({ toasts }: BoardToastProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <Box
      component="output"
      aria-live="polite"
      aria-atomic="true"
      className="fixed right-4.5 bottom-4.5 z-50 flex max-w-[min(340px,86vw)] flex-col gap-2.5"
    >
      {toasts.map((toast) => (
        <Paper
          key={toast.id}
          radius="md"
          className="lp-toast-in border-bd-2 bg-panel shadow-card flex items-center gap-3 border py-2.5 pr-3.5 pl-3.5"
          style={{ borderLeft: `3px solid ${ACCENT_VARS[toast.accent]}` }}
        >
          <Box
            className="h-2 w-2 flex-none rounded-full"
            style={{ backgroundColor: ACCENT_VARS[toast.accent] }}
          />
          <Stack gap={1}>
            <Text size="sm" fw={500} className="leading-tight">
              {toast.text}
            </Text>
            <Text size="xs" c="dimmed">
              {toast.who}
            </Text>
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}
