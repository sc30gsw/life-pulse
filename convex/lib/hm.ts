import { Doc } from "../_generated/dataModel";

const HM_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function hmToMinutes(hm: Doc<"studyBlocks">["startHm"] | Doc<"studyBlocks">["endHm"]) {
  if (!HM_PATTERN.test(hm)) {
    return null;
  }

  const [hours, minutes] = hm.split(":");

  return Number(hours) * 60 + Number(minutes);
}

export function minutesToHm(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
