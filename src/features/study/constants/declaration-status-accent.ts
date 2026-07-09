import type { AccentName, DeclarationStatus } from "~/types/dashboard";

export const DECLARATION_STATUS_ACCENT = {
  declined: "blue",
  done: "good",
  eroded: "coral",
  planned: "faint",
  rescheduled: "violet",
} as const satisfies Record<DeclarationStatus, AccentName>;
