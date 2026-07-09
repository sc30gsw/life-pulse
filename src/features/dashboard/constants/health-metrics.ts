import type { AccentName } from "~/types/dashboard";

export const DASHBOARD_HEALTH_METRICS = {
  bodyBattery: { accent: "good", type: "ring" },
  hrv: { type: "text" },
  sleepScore: { accent: "violet", type: "ring" },
  steps: { type: "text" },
} as const satisfies DashboardHealthMetrics;

type DashboardHealthMetrics = {
  bodyBattery: DashboardRingHealthMetric;
  hrv: DashboardTextHealthMetric;
  sleepScore: DashboardRingHealthMetric;
  steps: DashboardTextHealthMetric;
};

type DashboardRingHealthMetric = {
  accent: AccentName;
  type: "ring";
};

type DashboardTextHealthMetric = {
  type: "text";
};
