import {
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { Shimmer } from "@shimmer-from-structure/react";
import { cn } from "cnfast";
import { useState } from "react";

import { useDashboardPresence } from "~/features/dashboard/hooks/use-dashboard-presence";
import { useDashboardViewer } from "~/features/dashboard/hooks/use-dashboard-viewer";
import {
  ACCENT_CLASSES,
  ACCENT_SOLID_STYLE,
  ACCENT_VARS,
  PRESENCE_LABELS,
  PRESENCE_SUB_LABELS,
  type PresenceState,
} from "~/features/dashboard/types/dashboard";

const PRESENCE_ACCENTS = {
  commuting_home: "blue",
  home: "good",
  office: "amber",
  out: "violet",
  sleeping: "faint",
} as const satisfies Record<PresenceState, keyof typeof ACCENT_VARS>;

const PRESENCE_STATES = Object.keys(PRESENCE_LABELS) as PresenceState[];

export function PartnerCard() {
  const { onSetPresence, partner, partnerFlash, partnerUpdatedRelativeLabel } =
    useDashboardPresence();
  const viewer = useDashboardViewer();
  const isPartnerView = viewer.role === "partner";

  const [etaInput, setEtaInput] = useState("");
  const accent = partner === null ? "faint" : PRESENCE_ACCENTS[partner.state];

  return (
    <Paper
      className={cn(
        "bg-panel border-bd shadow-card relative overflow-hidden border",
        partnerFlash && "lp-flash",
      )}
      p="lg"
      radius={18}
    >
      <Group justify="space-between" mb="md">
        <Text
          fw={600}
          size="10.5px"
          style={{ letterSpacing: "0.13em" }}
          tt="uppercase"
          c={ACCENT_VARS.faint}
        >
          パートナー · 妻
        </Text>
        {isPartnerView && (
          <Badge size="xs" style={ACCENT_SOLID_STYLE.blue} variant="filled">
            YOU
          </Badge>
        )}
      </Group>

      <Group gap="md" mb="md" wrap="nowrap">
        <Box className="border-bd bg-inset relative flex h-13 w-13 items-center justify-center rounded-xl border">
          <Box
            className="h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: ACCENT_VARS[accent],
              boxShadow: `0 0 12px ${ACCENT_VARS[accent]}`,
            }}
          />
        </Box>
        <Stack gap={3}>
          <Text fw={600} size="22px" c={ACCENT_VARS[accent]}>
            {partner === null ? "未設定" : PRESENCE_LABELS[partner.state]}
          </Text>
          <Text size="sm" c="dimmed">
            {partner === null
              ? "まだステータスが更新されていません"
              : partner.etaHm
                ? `ETA ${partner.etaHm}`
                : PRESENCE_SUB_LABELS[partner.state]}
          </Text>
          <Text size="xs" c={ACCENT_VARS.faint}>
            更新 {partnerUpdatedRelativeLabel}
          </Text>
        </Stack>
      </Group>

      {/* FR-8.1 / plan §3-5: the ETA input appears only while 帰宅中 is the active state. */}
      {isPartnerView && partner?.state === "commuting_home" && (
        <Group gap={8} mb="sm" wrap="nowrap">
          <TextInput
            aria-label="帰宅ETA"
            onChange={(event) => setEtaInput(event.currentTarget.value)}
            placeholder="20:30"
            size="xs"
            value={etaInput}
          />
          <Button
            className="border-bd-2 text-tx"
            onClick={() => onSetPresence("commuting_home", etaInput === "" ? undefined : etaInput)}
            size="xs"
            type="button"
            variant="outline"
          >
            ETA設定
          </Button>
        </Group>
      )}

      {isPartnerView && (
        <Group gap={8} wrap="wrap">
          {PRESENCE_STATES.map((state) => {
            const isActive = partner !== null && state === partner.state;
            const stateAccent = ACCENT_CLASSES[PRESENCE_ACCENTS[state]];

            return (
              <UnstyledButton
                key={state}
                type="button"
                aria-pressed={isActive}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs",
                  isActive
                    ? cn(
                        stateAccent.border,
                        stateAccent.bg,
                        stateAccent.text,
                        "border font-semibold",
                      )
                    : "border-bd-2 bg-inset text-dim border font-medium",
                )}
                onClick={() => onSetPresence(state)}
              >
                {PRESENCE_LABELS[state]}
              </UnstyledButton>
            );
          })}
        </Group>
      )}
    </Paper>
  );
}

export function PartnerCardFallback() {
  return (
    <Shimmer loading>
      <Paper
        className="bg-panel border-bd shadow-card relative overflow-hidden border"
        p="lg"
        radius={18}
      >
        <Group justify="space-between" mb="md">
          <Text
            fw={600}
            size="10.5px"
            style={{ letterSpacing: "0.13em" }}
            tt="uppercase"
            c={ACCENT_VARS.faint}
          >
            パートナー · 妻
          </Text>
          <Badge size="xs" style={ACCENT_SOLID_STYLE.blue} variant="filled">
            YOU
          </Badge>
        </Group>

        <Group gap="md" mb="md" wrap="nowrap">
          <Box className="border-bd bg-inset relative flex h-13 w-13 items-center justify-center rounded-xl border">
            <Box
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor: ACCENT_VARS.good,
                boxShadow: `0 0 12px ${ACCENT_VARS.good}`,
              }}
            />
          </Box>
          <Stack gap={3}>
            <Text fw={600} size="22px" c={ACCENT_VARS.good}>
              在宅
            </Text>
            <Text size="sm" c="dimmed">
              家にいます
            </Text>
            <Text size="xs" c={ACCENT_VARS.faint}>
              更新 たった今
            </Text>
          </Stack>
        </Group>

        <Group gap={8} wrap="wrap">
          {PRESENCE_STATES.map((state) => (
            <Box
              key={state}
              className="border-bd-2 bg-inset text-dim rounded-lg border px-3 py-1.5 text-xs font-medium"
            >
              {PRESENCE_LABELS[state]}
            </Box>
          ))}
        </Group>
      </Paper>
    </Shimmer>
  );
}
