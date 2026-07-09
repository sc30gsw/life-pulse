import type {
  BLOCK_STATUS_VALUES,
  EROSION_REASON_VALUES,
  INTERRUPTION_REASON_VALUES,
  PRESENCE_STATE_VALUES,
  SESSION_STATUS_VALUES,
  WORKOUT_KIND_VALUES,
} from "~/../convex/lib/domain";

// Display-oriented tokens for the Live Board UI (see docs/design/live-board.md).
// Data-shape types are NOT duplicated here — components import `Doc`/`FunctionReturnType`
// from Convex's generated types directly, so convex/schema.ts stays the single source of
// truth. Domain value types derive from convex/lib/domain.ts value tuples, per CVX-16.

export type InterruptionReason = (typeof INTERRUPTION_REASON_VALUES)[number];

export type ErosionReason = (typeof EROSION_REASON_VALUES)[number];

export type SessionStatus = (typeof SESSION_STATUS_VALUES)[number];

export type WorkoutKind = (typeof WORKOUT_KIND_VALUES)[number];

export type DeclarationStatus = (typeof BLOCK_STATUS_VALUES)[number];

export type PresenceState = (typeof PRESENCE_STATE_VALUES)[number];

export type AccentName = "good" | "amber" | "blue" | "coral" | "violet" | "faint";

// Shared accent → Tailwind token class mapping. All chips/dots/pills across the board
// (session status, fasting phase, partner presence, dog care) key off this
// single map so accent colors stay consistent without hardcoding hex anywhere.
export const ACCENT_CLASSES = {
  amber: { bg: "bg-amber/16", border: "border-amber", text: "text-amber" },
  blue: { bg: "bg-blue/16", border: "border-blue", text: "text-blue" },
  coral: { bg: "bg-coral/16", border: "border-coral", text: "text-coral" },
  faint: { bg: "bg-inset", border: "border-bd-2", text: "text-faint" },
  good: { bg: "bg-good/16", border: "border-good", text: "text-good" },
  violet: { bg: "bg-violet/16", border: "border-violet", text: "text-violet" },
} as const satisfies Record<AccentName, Record<"bg" | "border" | "text", string>>;

// Raw CSS custom-property references, for Mantine props that apply a color directly
// without computing a light/dark variant (Progress `color`, RingProgress section `color`).
export const ACCENT_VARS = {
  amber: "var(--amber)",
  blue: "var(--blue)",
  coral: "var(--coral)",
  faint: "var(--faint)",
  good: "var(--good)",
  violet: "var(--violet)",
} as const satisfies Record<AccentName, string>;

// Ready-made {backgroundColor, color} pairs for solid Mantine elements (Button, Badge)
// whose built-in variant/auto-contrast color math cannot resolve an opaque CSS custom
// property — pass this object to the component's `style` prop. Text is always `--bg`
// (the page background token) since every accent here is a light color meant to sit
// on the page background, matching the canonical design.
export const ACCENT_SOLID_STYLE = {
  amber: { backgroundColor: "var(--amber)", color: "var(--bg)" },
  blue: { backgroundColor: "var(--blue)", color: "var(--bg)" },
  coral: { backgroundColor: "var(--coral)", color: "var(--bg)" },
  faint: { backgroundColor: "var(--faint)", color: "var(--bg)" },
  good: { backgroundColor: "var(--good)", color: "var(--bg)" },
  violet: { backgroundColor: "var(--violet)", color: "var(--bg)" },
} as const satisfies Record<AccentName, Record<"backgroundColor" | "color", string>>;

export type ThemeMode = "dark" | "light";
