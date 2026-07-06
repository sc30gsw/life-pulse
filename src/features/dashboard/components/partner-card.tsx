import { Badge, Box, Group, Paper, Stack, Text, UnstyledButton } from "@mantine/core";
import { cn } from "cnfast";

import {
  ACCENT_CLASSES,
  ACCENT_SOLID_STYLE,
  ACCENT_VARS,
  PRESENCE_LABELS,
  PRESENCE_SUB_LABELS,
  type PartnerState,
  type PresenceState,
} from "~/features/dashboard/types/dashboard";

type PartnerCardProps = {
  isPartnerView: boolean;
  onSetPresence: (state: PresenceState) => void;
  partner: PartnerState;
  partnerFlash: boolean;
  partnerUpdatedRelativeLabel: string;
};

const PRESENCE_ACCENTS = {
  commuting_home: "blue",
  home: "good",
  office: "amber",
  out: "violet",
  sleeping: "faint",
} as const satisfies Record<PresenceState, keyof typeof ACCENT_VARS>;

const PRESENCE_STATES = Object.keys(PRESENCE_LABELS) as PresenceState[];

export function PartnerCard({
  isPartnerView,
  onSetPresence,
  partner,
  partnerFlash,
  partnerUpdatedRelativeLabel,
}: PartnerCardProps) {
  const accent = PRESENCE_ACCENTS[partner.state];

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
            {PRESENCE_LABELS[partner.state]}
          </Text>
          <Text size="sm" c="dimmed">
            {partner.etaHm ? `ETA ${partner.etaHm}` : PRESENCE_SUB_LABELS[partner.state]}
          </Text>
          <Text size="xs" c={ACCENT_VARS.faint}>
            更新 {partnerUpdatedRelativeLabel}
          </Text>
        </Stack>
      </Group>

      <Group gap={8} wrap="wrap">
        {PRESENCE_STATES.map((state) => {
          const isActive = state === partner.state;
          const stateAccent = ACCENT_CLASSES[PRESENCE_ACCENTS[state]];

          return (
            <UnstyledButton
              key={state}
              type="button"
              aria-pressed={isActive}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs",
                isActive
                  ? cn(stateAccent.border, stateAccent.bg, stateAccent.text, "border font-semibold")
                  : "border-bd-2 bg-inset text-dim border font-medium",
              )}
              onClick={() => onSetPresence(state)}
            >
              {PRESENCE_LABELS[state]}
            </UnstyledButton>
          );
        })}
      </Group>
    </Paper>
  );
}
