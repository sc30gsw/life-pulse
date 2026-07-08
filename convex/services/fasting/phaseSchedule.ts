import type { Doc } from "../../_generated/dataModel";
import { FASTING_FATBURN_MINUTES } from "../../lib/domain";

type ScheduledFastingPhase = Exclude<Doc<"fastingWindows">["phase"], "early">;
type PhaseScheduleEntry = {
  afterMinutes: Doc<"fastingWindows">["targetMinutes"];
  to: ScheduledFastingPhase;
};

export function phaseSchedule(
  targetMinutes: Doc<"fastingWindows">["targetMinutes"],
): PhaseScheduleEntry[] {
  if (targetMinutes >= FASTING_FATBURN_MINUTES) {
    return [
      { afterMinutes: FASTING_FATBURN_MINUTES, to: "fatburn" },
      { afterMinutes: targetMinutes, to: "goal" },
    ];
  }

  return [
    { afterMinutes: targetMinutes / 2, to: "fatburn" },
    { afterMinutes: targetMinutes, to: "goal" },
  ];
}
