import { Badge, Group, Paper, Text } from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { cn } from "cnfast";
import { Suspense } from "react";

import { GlowCard } from "~/components/glow-card";
import { SelfBadge, SelfBadgeFallback } from "~/features/dashboard/components/session-self-badge";
import {
  SessionStatusGroup,
  SessionStatusGroupFallback,
} from "~/features/dashboard/components/session-status-group";
import { ACCENT_SOLID_STYLE, ACCENT_VARS } from "~/types/dashboard";

export function SessionFastingCard({
  sessionFlash = false,
}: Partial<Record<"sessionFlash", boolean>> = {}) {
  return (
    <GlowCard
      radius={18}
      p="lg"
      className={cn(
        "bg-panel border-bd shadow-card relative overflow-hidden border",
        sessionFlash && "lp-flash",
      )}
    >
      <Group justify="space-between" mb="md">
        <Group gap={10}>
          <Text
            size="11px"
            fw={600}
            tt="uppercase"
            c={ACCENT_VARS.faint}
            style={{ letterSpacing: "0.14em" }}
          >
            本人 · 発注者
          </Text>
          <Suspense fallback={<SelfBadgeFallback />}>
            <SelfBadge />
          </Suspense>
        </Group>
        <Text size="xs" c="dimmed">
          study session
        </Text>
      </Group>
      <Suspense fallback={<SessionStatusGroupFallback />}>
        <SessionStatusGroup />
      </Suspense>
    </GlowCard>
  );
}

export function SessionFastingCardFallback() {
  return (
    <Shimmer loading>
      <Paper
        radius={18}
        p="lg"
        className="bg-panel border-bd shadow-card relative overflow-hidden border"
      >
        <Group justify="space-between" mb="md">
          <Group gap={10}>
            <Text
              size="11px"
              fw={600}
              tt="uppercase"
              c={ACCENT_VARS.faint}
              style={{ letterSpacing: "0.14em" }}
            >
              本人 · 発注者
            </Text>
            <Badge variant="filled" style={ACCENT_SOLID_STYLE.good} size="xs">
              YOU
            </Badge>
          </Group>
          <Text size="xs" c="dimmed">
            study session
          </Text>
        </Group>
        <SessionStatusGroupFallback />
      </Paper>
    </Shimmer>
  );
}
