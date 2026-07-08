import type { AccentName } from "~/types/dashboard";

export const DASHBOARD_HEALTH_METRICS = [
  { accent: "good", id: "bodyBattery", type: "ring" },
  { accent: "violet", id: "sleepScore", type: "ring" },
  { id: "hrv", type: "text" },
  { id: "steps", type: "text" },
] as const satisfies readonly DashboardHealthMetric[];

type DashboardHealthMetric =
  | {
      accent: AccentName;
      id: "bodyBattery" | "sleepScore";
      type: "ring";
    }
  | {
      id: "hrv" | "steps";
      type: "text";
    };
