import type { Doc } from "../../_generated/dataModel";
import { hmToMinutes, minutesToHm } from "../../lib/hm";

const SLOT_STEP_MINUTES = 30;
const DAY_END_MINUTES = 22 * 60;
const MAX_SUGGESTIONS = 5;

// spec §4.3: from now (rounded up to the next 30-minute mark) until 22:00,
// return up to 5 slot start times that do not overlap any planned block.
// Pure function (CVX-09) — no ctx, unit-testable directly.
export function suggestRescheduleSlots(
  blocks: Doc<"studyBlocks">[],
  nowHm: Doc<"studyBlocks">["startHm"] | Doc<"studyBlocks">["endHm"],
) {
  const now = hmToMinutes(nowHm);

  if (now === null) {
    return [];
  }

  const plannedRanges = blocks.flatMap((block) => {
    if (block.status !== "planned") {
      return [];
    }

    const start = hmToMinutes(block.startHm);
    const end = hmToMinutes(block.endHm);

    return start === null || end === null ? [] : [{ end, start }];
  });

  const firstCandidate = Math.ceil(now / SLOT_STEP_MINUTES) * SLOT_STEP_MINUTES;
  const suggestions: Doc<"studyBlocks">["startHm"][] = [];

  for (
    let candidate = firstCandidate;
    candidate + SLOT_STEP_MINUTES <= DAY_END_MINUTES && suggestions.length < MAX_SUGGESTIONS;
    candidate += SLOT_STEP_MINUTES
  ) {
    const candidateEnd = candidate + SLOT_STEP_MINUTES;
    const overlaps = plannedRanges.some(
      (range) => candidate < range.end && candidateEnd > range.start,
    );

    if (!overlaps) {
      suggestions.push(minutesToHm(candidate));
    }
  }

  return suggestions;
}
