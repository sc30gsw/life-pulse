import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";

import {
  appSettingsFieldValidators,
  appUserFieldValidators,
  dogEventFieldValidators,
  fastingWindowFieldValidators,
  healthMetricFieldValidators,
  interruptionFieldValidators,
  presenceFieldValidators,
  studyBlockFieldValidators,
  studySessionFieldValidators,
  syncLogFieldValidators,
  workoutFieldValidators,
} from "./lib/validators";

export default defineSchema({
  ...authTables,

  appUsers: defineTable(appUserFieldValidators)
    .index("by_subject", ["authSubject"])
    .index("by_role", ["role"]),

  // FR-2 学習セッション(ライブ状態そのもの)
  studySessions: defineTable(studySessionFieldValidators)
    .index("by_user_status", ["userId", "status"])
    .index("by_user_date", ["userId", "dateJst"]),

  // FR-2.4 中断ログ
  interruptions: defineTable(interruptionFieldValidators).index("by_session", ["sessionId"]),

  // FR-3 学習枠
  studyBlocks: defineTable(studyBlockFieldValidators).index("by_user_date", ["userId", "dateJst"]),

  // FR-4 断食ウィンドウ(ステートマシン)
  fastingWindows: defineTable(fastingWindowFieldValidators).index("by_user_status", [
    "userId",
    "status",
  ]),

  // FR-5 犬ケアイベント(当日の済/未は当日イベント有無から導出)
  dogEvents: defineTable(dogEventFieldValidators).index("by_date", ["dateJst"]),

  // FR-6 日次健康メトリクス(本人のみ)
  healthMetrics: defineTable(healthMetricFieldValidators).index("by_date", ["dateJst"]), // 同日再同期はpatchで上書き(demoは別レコード可)

  // FR-6.5 ワークアウト
  workouts: defineTable(workoutFieldValidators).index("by_date", ["dateJst"]),

  // FR-8 パートナーステータス(ユーザーごとに最新1件をpatch更新)
  presence: defineTable(presenceFieldValidators).index("by_user", ["userId"]),

  // FR-6.3 同期ログ
  syncLogs: defineTable(syncLogFieldValidators),

  // 設定(単一ドキュメント運用)
  appSettings: defineTable(appSettingsFieldValidators),
});
