import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import {
  blockStatusValidator,
  categoryValidator,
  dogEventKindValidator,
  erosionReasonValidator,
  fastingPhaseValidator,
  healthSourceValidator,
  interruptionReasonValidator,
  presenceStateValidator,
  roleValidator,
  sessionStatusValidator,
  workoutKindValidator,
} from "./lib/validators";

export default defineSchema({
  ...authTables,

  appUsers: defineTable({
    authSubject: v.string(),
    displayName: v.string(),
    role: roleValidator,
  })
    .index("by_subject", ["authSubject"])
    .index("by_role", ["role"]),

  // FR-2 学習セッション(ライブ状態そのもの)
  studySessions: defineTable({
    userId: v.id("appUsers"),
    status: sessionStatusValidator,
    category: categoryValidator,
    startedAt: v.number(), // epoch ms
    lastResumedAt: v.optional(v.number()), // activeのとき必須
    accumulatedMs: v.number(), // pause/complete時に加算確定した分
    plannedMinutes: v.optional(v.number()),
    blockId: v.optional(v.id("studyBlocks")),
    endedAt: v.optional(v.number()),
    interruptionCount: v.number(),
    abandonJobId: v.optional(v.id("_scheduled_functions")), // FR-2.7
    dateJst: v.string(), // "YYYY-MM-DD"(JST) 集計用
  })
    .index("by_user_status", ["userId", "status"])
    .index("by_user_date", ["userId", "dateJst"]),

  // FR-2.4 中断ログ
  interruptions: defineTable({
    sessionId: v.id("studySessions"),
    reason: interruptionReasonValidator,
    pausedAt: v.number(),
    resumedAt: v.optional(v.number()),
  }).index("by_session", ["sessionId"]),

  // FR-3 学習枠
  studyBlocks: defineTable({
    userId: v.id("appUsers"),
    dateJst: v.string(),
    startHm: v.string(), // "06:00"
    endHm: v.string(),
    category: v.string(),
    plannedMinutes: v.number(),
    status: blockStatusValidator,
    erosionReason: v.optional(erosionReasonValidator),
    rescheduledToId: v.optional(v.id("studyBlocks")), // リスケ先リンク(FR-3.3)
    source: v.union(v.literal("manual"), v.literal("suggested")), // FR-3.5
  }).index("by_user_date", ["userId", "dateJst"]),

  // FR-4 断食ウィンドウ(ステートマシン)
  fastingWindows: defineTable({
    userId: v.id("appUsers"),
    status: v.union(v.literal("fasting"), v.literal("ended")),
    phase: fastingPhaseValidator,
    startedAt: v.number(),
    targetMinutes: v.number(), // 既定 960(=16h)。デモ用に分指定可(AC-2)
    endedAt: v.optional(v.number()),
    actualMinutes: v.optional(v.number()),
    phaseJobIds: v.array(v.id("_scheduled_functions")), // 終了時に全キャンセル(FR-4.3)
  }).index("by_user_status", ["userId", "status"]),

  // FR-5 犬ケアイベント(当日の済/未は当日イベント有無から導出)
  dogEvents: defineTable({
    kind: dogEventKindValidator,
    byUserId: v.id("appUsers"),
    at: v.number(),
    dateJst: v.string(),
    note: v.optional(v.string()),
  }).index("by_date", ["dateJst"]),

  // FR-6 日次健康メトリクス(本人のみ)
  healthMetrics: defineTable({
    dateJst: v.string(),
    source: healthSourceValidator,
    sleepScore: v.optional(v.number()),
    sleepMinutes: v.optional(v.number()),
    bodyBattery: v.optional(v.number()), // 起床時 or 当日最大
    hrv: v.optional(v.number()),
    restingHr: v.optional(v.number()),
    steps: v.optional(v.number()),
    syncedAt: v.number(),
  }).index("by_date", ["dateJst"]), // 同日再同期はpatchで上書き(demoは別レコード可)

  // FR-6.5 ワークアウト
  workouts: defineTable({
    kind: workoutKindValidator,
    at: v.number(),
    dateJst: v.string(),
    durationMinutes: v.number(),
    perceivedIntensity: v.optional(v.number()), // 1-10
  }).index("by_date", ["dateJst"]),

  // FR-8 パートナーステータス(ユーザーごとに最新1件をpatch更新)
  presence: defineTable({
    userId: v.id("appUsers"),
    state: presenceStateValidator,
    etaHm: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // FR-6.3 同期ログ
  syncLogs: defineTable({
    source: v.string(),
    at: v.number(),
    ok: v.boolean(),
    message: v.optional(v.string()),
  }),

  // 設定(単一ドキュメント運用)
  appSettings: defineTable({
    demoMode: v.boolean(),
    demoJobId: v.optional(v.id("_scheduled_functions")),
    dogName: v.string(),
    fastingDefaultMinutes: v.number(),
  }),
});
