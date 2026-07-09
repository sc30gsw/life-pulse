import type { Doc } from "~/../convex/_generated/dataModel";
import type { AccentName } from "~/types/dashboard";

export const FASTING_PHASE_ACCENT = {
  early: "blue",
  fatburn: "amber",
  goal: "good",
} as const satisfies Record<Doc<"fastingWindows">["phase"], AccentName>;

export const FASTING_PHASE_ORDER = [
  "early",
  "fatburn",
  "goal",
] as const satisfies readonly Doc<"fastingWindows">["phase"][];
