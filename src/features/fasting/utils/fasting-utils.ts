import type { TimePicker } from "@mantine/dates";
import type { FunctionReturnType } from "convex/server";
import type { ComponentProps } from "react";

import type { api } from "~/../convex/_generated/api";
import type { useBoardClock } from "~/features/dashboard/hooks/use-board-clock";
import type { StartFastingInput } from "~/features/fasting/schemas/start-fasting-schema";

const MINUTE_MS = 60_000;
const HHMM_PATTERN = /^(\d+):(\d{2})$/;

export function deriveFastingElapsedMinutes(
  fastingStartedAt: NonNullable<
    FunctionReturnType<typeof api.queries.dashboard.fasting.fasting>
  >["startedAt"],
  nowMs: ReturnType<typeof useBoardClock>["nowMs"],
) {
  return Math.max(0, (nowMs - fastingStartedAt) / MINUTE_MS);
}

export function minutesToHhmm(minutes: StartFastingInput["targetMinutes"]) {
  if (minutes === undefined) {
    return "";
  }

  const hours = Math.floor(minutes / 60);
  const remainderMinutes = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(remainderMinutes).padStart(2, "0")}`;
}

export function hhmmToMinutes(
  value: Parameters<NonNullable<ComponentProps<typeof TimePicker>["onChange"]>>[0],
) {
  const match = HHMM_PATTERN.exec(value);

  if (!match) {
    return undefined;
  }

  const [, hours, minutes] = match;

  return Number(hours) * 60 + Number(minutes);
}
