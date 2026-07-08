import type { Doc } from "../../_generated/dataModel";

type ScheduledFastingPhase = Exclude<Doc<"fastingWindows">["phase"], "early">;
type PhaseScheduleEntry = {
  afterMinutes: Doc<"fastingWindows">["targetMinutes"];
  to: ScheduledFastingPhase;
};

export function phaseSchedule(
  targetMinutes: Doc<"fastingWindows">["targetMinutes"],
): PhaseScheduleEntry[] {
  if (targetMinutes >= 720) {
    return [
      { afterMinutes: 720, to: "fatburn" },
      { afterMinutes: targetMinutes, to: "goal" },
    ];
  }

  return [
    { afterMinutes: targetMinutes / 2, to: "fatburn" },
    { afterMinutes: targetMinutes, to: "goal" },
  ];
}
