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
    syncErrorMessage: "同期のリクエストに失敗しました",
    syncSuccessMessage: "Garminとの同期をリクエストしました",
    syncSuccessTitle: "同期を開始しました",
  },
  title: "健康メトリクス · Garmin",
} as const;

export const DASHBOARD_HEALTH_METRICS = [
  { accent: "good", id: "bodyBattery", label: "Body Battery", subLabel: "起床時", type: "ring" },
  { accent: "violet", id: "sleepScore", label: "睡眠スコア", type: "ring" },
  { id: "hrv", label: "HRV", type: "text" },
  { id: "steps", label: "歩数", type: "text" },
] as const;

export const DASHBOARD_HEALTH_FALLBACK_VALUE = "88";
