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
import { useInputState } from "@mantine/hooks";
import { Shimmer } from "@shimmer-from-structure/react";
import { cn } from "cnfast";
import type { FunctionArgs, FunctionReturnType } from "convex/server";

import { PRESENCE_STATE_VALUES } from "~/../convex/lib/domain";
import { GlowCard } from "~/components/glow-card";
import {
  ACCENT_CLASSES,
  ACCENT_SOLID_STYLE,
  ACCENT_VARS,
  type PresenceState,
} from "~/types/dashboard";

import type { api } from "../../../../convex/_generated/api";

const PRESENCE_ACCENTS = {
  commuting_home: "blue",
  home: "good",
  office: "amber",
  out: "violet",
  sleeping: "faint",
} as const satisfies Record<PresenceState, keyof typeof ACCENT_VARS>;

const PRESENCE_STATES = PRESENCE_STATE_VALUES;

function presenceLabel(state: PresenceState) {
  switch (state) {
    case "commuting_home":
      return "帰宅中";

    case "home":
      return "在宅";

    case "office":
      return "出社中";

    case "out":
      return "外出";

    case "sleeping":
      return "就寝";
  }
}

function presenceSubLabel(state: PresenceState) {
  switch (state) {
    case "commuting_home":
      return "ETA 20:30";

    case "home":
      return "家にいます";

    case "office":
      return "オフィス勤務";

    case "out":
      return "外にいます";

    case "sleeping":
      return "おやすみ";
  }
}

type PresenceCardProps = {
  editable: boolean;
  flash?: boolean;
  flashRef?: (element: HTMLDivElement | null) => void;
  onSetPresence: (
    state: PresenceState,
    etaHm?: FunctionArgs<typeof api.mutations.partnerStatus.setStatus.setStatus>["etaHm"],
  ) => void;
  presence: FunctionReturnType<typeof api.queries.dashboard.presence.presence>;
  title: string;
  updatedRelativeLabel: string;
};

export function PresenceCard({
  editable,
  flash = false,
  flashRef,
  onSetPresence,
  presence,
  title,
  updatedRelativeLabel,
}: PresenceCardProps) {
  const [etaInput, setEtaInput] = useInputState("");
  const accent = presence === null ? "faint" : PRESENCE_ACCENTS[presence.state];

  return (
    <GlowCard
      ref={flashRef}
      className={cn(
        "bg-panel border-bd shadow-card relative overflow-hidden border",
        flash && "lp-flash",
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
          {title}
        </Text>
        {editable && (
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
            {presence === null ? "未設定" : presenceLabel(presence.state)}
          </Text>
          <Text size="sm" c="dimmed">
            {presence === null
              ? "まだステータスが更新されていません"
              : presence.etaHm
                ? `ETA ${presence.etaHm}`
                : presenceSubLabel(presence.state)}
          </Text>
          <Text size="xs" c={ACCENT_VARS.faint}>
            更新 {updatedRelativeLabel}
          </Text>
        </Stack>
      </Group>

      {/* FR-8.1 / plan §3-5: the ETA input appears only while 帰宅中 is the active state. */}
      {editable && presence?.state === "commuting_home" && (
        <Group gap={8} mb="sm" wrap="nowrap">
          <TextInput
            aria-label="帰宅ETA"
            onChange={setEtaInput}
            placeholder="20:30"
            size="xs"
            value={etaInput}
          />
          <Button
            className="border-bd-2 text-tx transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
            onClick={() => onSetPresence("commuting_home", etaInput === "" ? undefined : etaInput)}
            size="xs"
            type="button"
            variant="outline"
          >
            ETA設定
          </Button>
        </Group>
      )}

      {editable && (
        <Group gap={8} wrap="wrap">
          {PRESENCE_STATES.map((state) => {
            const isActive = presence !== null && state === presence.state;
            const stateAccent = ACCENT_CLASSES[PRESENCE_ACCENTS[state]];

            return (
              <UnstyledButton
                key={state}
                type="button"
                aria-pressed={isActive}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs",
                  "transition hover:brightness-110 active:brightness-95",
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
                {presenceLabel(state)}
              </UnstyledButton>
            );
          })}
        </Group>
      )}
    </GlowCard>
  );
}

export function PresenceCardFallback({ title }: Record<"title", string>) {
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
            {title}
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
              {presenceLabel(state)}
            </Box>
          ))}
        </Group>
      </Paper>
    </Shimmer>
  );
}
