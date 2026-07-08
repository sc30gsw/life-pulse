import type { AccentName } from "~/types/dashboard";

export const DASHBOARD_HEALTH_COPY = {
  actions: {
    details: "詳細",
    syncGarmin: "Garminを同期",
  },
  empty: {
    description: "Garminを同期すると、睡眠・Body Battery・歩数をここに表示します。",
    title: "今日のデータはまだありません",
  },
  fallbackSource: "source: garmin",
  notification: {
    errorTitle: "エラー",
    syncErrorMessage: "同期のリクエストに失敗しました",
    syncSuccessMessage: "Garminとの同期をリクエストしました",
    syncSuccessTitle: "同期を開始しました",
  },
  status: {
    hiitLabel: "HIIT",
    hiitWeeklyAchievement: "週2 達成",
    noSync: "未同期",
    restingHeartRate: "安静時心拍",
  },
  title: "健康メトリクス · Garmin",
} as const satisfies DashboardHealthCopy;

export const DASHBOARD_HEALTH_METRICS = [
  { accent: "good", id: "bodyBattery", label: "Body Battery", subLabel: "起床時", type: "ring" },
  { accent: "violet", id: "sleepScore", label: "睡眠スコア", type: "ring" },
  { id: "hrv", label: "HRV", type: "text" },
  { id: "steps", label: "歩数", type: "text" },
] as const satisfies readonly DashboardHealthMetric[];

export const DASHBOARD_HEALTH_FALLBACK_VALUE = "88" as const satisfies string;

type DashboardHealthCopy = {
  actions: Record<"details" | "syncGarmin", string>;
  empty: Record<"description" | "title", string>;
  fallbackSource: string;
  notification: Record<
    "errorTitle" | "syncErrorMessage" | "syncSuccessMessage" | "syncSuccessTitle",
    string
  >;
  status: Record<"hiitLabel" | "hiitWeeklyAchievement" | "noSync" | "restingHeartRate", string>;
  title: string;
};

type DashboardHealthMetric =
  | {
      accent: AccentName;
      id: "bodyBattery" | "sleepScore";
      label: string;
      subLabel?: string;
      type: "ring";
    }
  | {
      id: "hrv" | "steps";
      label: string;
      type: "text";
    };
