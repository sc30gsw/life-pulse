# 技術仕様書 — Life Pulse(仮称)

- 版: v1.2(2026-07-06: FR-9 を Convex Auth+オープンサインアップに改訂、デザイン準拠規約を追加)
- 前提文書: `requirements.md`(要件ID FR-x / NFR-x / AC-x を本書から参照する)、`convex-rules.md`(必須コーディング規約 CVX-01〜20)
- 対象読者: 実装を担当するAIエージェント。**本書の規約に従えば、要件定義書とセットでそのまま実装着手できる**ことを意図する。

---

## 0. 実装エージェントへの指示(必読)

1. **最新ドキュメントを必ず確認すること。** TanStack Start はRC段階で破壊的変更があり得る。着手時に以下を参照し、本書のコード断片と差異があれば**公式ドキュメントを正**とする:
   - Convex × TanStack Start Quickstart: https://docs.convex.dev/quickstart/tanstack-start
   - Convex × TanStack Start 解説: https://docs.convex.dev/client/tanstack/tanstack-start/
   - Convex × TanStack Query アダプタ: https://docs.convex.dev/client/tanstack/tanstack-query/
   - 認証(Convex Auth): https://labs.convex.dev/auth
   - Convex scheduled functions / crons: https://docs.convex.dev/scheduling/scheduled-functions , https://docs.convex.dev/scheduling/cron-jobs
2. パッケージバージョンは固定しない。`npm create convex@latest` のTanStack Startテンプレート、または公式Quickstartの手順で最新を導入する。
3. 本書の**スキーマ・状態遷移・関数の責務分担は正**とする。UIのビジュアルは `docs/design/live-board.md`(claude_design のデザインファイルが正)に準拠すること。コンポーネント分割は実装者の裁量。
4. 秘密情報(Garmin認証、Clerkキー)は環境変数のみ。コミット禁止。
5. **`convex-rules.md`(Convex実装ルール集)は必須規約。** 本書のすべての実装はルールID(CVX-01〜20)に適合すること。特に: 公開関数は薄いAPI層+ロジックは `convex/model/`(CVX-02)、全公開関数にvalidator+`requireUser`(CVX-03/04)、scheduler/cronsはinternalのみ(CVX-05)、queryで`Date.now()`禁止(CVX-14)、`.filter`禁止・index必須(CVX-10/11)。
6. 各週の成果物は動く状態でmainにマージする(発表1週間前=W4開始時点で「手動+デモモードで発表できる」状態を維持する)。

## 1. 技術スタック

| 層               | 採用                                                                                                                  | 備考                                                                                                                                                                                                                                                                           |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| フレームワーク   | TanStack Start(React)                                                                                                 | ファイルベースルーティング、SSR                                                                                                                                                                                                                                                |
| データ層         | Convex                                                                                                                | reactive queries / mutations / actions / scheduler / crons / file storage                                                                                                                                                                                                      |
| クライアント統合 | `@convex-dev/react-query` + `@tanstack/react-query`(+ `@tanstack/react-router-ssr-query`)                             | `useSuspenseQuery(convexQuery(...))` でSSR+ライブ購読。Convex公式推奨の統合形                                                                                                                                                                                                  |
| 認証             | Convex Auth(`@convex-dev/auth`)Password provider を`ConvexAuthProvider`(`@convex-dev/auth/react`)でクライアント側利用 | **オープンサインアップ(v1.2)**: `/signup` で誰でも登録可、role(self/partner)は登録時に自己選択。localStorageトークンによるクライアント側認証で、SSR時点で認証済みの初回描画にはならない(個人用アプリとして許容済みのトレードオフ)。本方式が実装困難と判明した場合の代替: Clerk |
| UI               | Mantine(core / hooks / charts / dates)+ Tailwind CSS(`tailwind-preset-mantine`経由で連携)                             | ライブボードはカードUI                                                                                                                                                                                                                                                         |
| フォーム         | Formisch(`@formisch/react`)+ valibot                                                                                  | `useForm({ schema })` / `<Form of>` / `<Field of path>` によるvalibotネイティブなフォーム実装                                                                                                                                                                                  |
| チャート         | `@mantine/charts`(内部実装はRecharts)                                                                                 | 相関ビュー・メトリクス推移                                                                                                                                                                                                                                                     |
| Garmin           | `garmin-connect`(npm, 非公式)                                                                                         | Convex "use node" action 内で使用。MFA有効アカウントはOAuth1/OAuth2トークンを事前生成し環境変数へ(トークンは約90日で失効 → 再生成手順をREADMEに記載)                                                                                                                           |
| デプロイ         | Convex(バックエンド)+ Netlify/Vercel(Start)                                                                           | デモは本番URLで行う(localhost 2端末より確実)                                                                                                                                                                                                                                   |

## 2. リポジトリ構成(規約)

> `convex/` は Zenn記事(taroosg)準拠の `queries/` `mutations/` `actions/` `services/` ドメイン分割(1関数1ファイル)を正とする(`.claude/rules/convex-rules.md` CVX-20)。**`api/` ディレクトリは作らない** — Convexでは `query`/`mutation`/`action` の登録自体がフロント向けAPIそのものであり、その上に重ねる `api/` 層は冗長なため(CVX-01/02)。`services/` はビジネスロジック層(旧`model/`の後継名、CVX-02/09)。`lib/` はドメイン分割の対象外で、認証ガードや日付ヘルパ等の横断的ユーティリティを置く。認証関連の `auth.ts` / `auth.config.ts` / `http.ts` はConvex Authのフレームワーク規約ファイルであり、ドメインファイルではないため `convex/` 直下に置く。

```
/
├── convex/
│   ├── schema.ts            # 本書 §3 を忠実に実装(唯一の真実源, CVX-16)
│   ├── auth.ts              # Convex Auth(Password provider, FR-9)
│   ├── auth.config.ts       # Convex Auth providers設定
│   ├── http.ts              # Convex Auth HTTPルート
│   ├── crons.ts             # cron定義(internal関数のみ参照, CVX-05)
│   ├── queries/             # 公開query。1関数1ファイル(CVX-20)
│   │   ├── users/viewer.ts        # 認証ユーザーのappUsers解決
│   │   ├── sessions/current.ts    # FR-2
│   │   ├── blocks/todayWithSuggestions.ts  # FR-3
│   │   ├── health/range.ts        # FR-6
│   │   ├── dashboard/live.ts      # FR-1 ライブボード集約
│   │   └── correlations/sleepVsStudy.ts    # FR-7
│   ├── mutations/           # 公開mutation。1関数1ファイル(CVX-20)
│   │   ├── users/ensureUser.ts    # サインアップ時のappUsers作成(オープンサインアップ, FR-9.3)
│   │   ├── sessions/{start,pause,resume,complete}.ts  # FR-2
│   │   ├── blocks/{declare,erode,reschedule}.ts       # FR-3
│   │   ├── fasting/{start,end}.ts                     # FR-4
│   │   ├── dog/{logEvent,undoEvent}.ts                # FR-5
│   │   ├── health/{upsertManual,logWorkout,upsertFromSync}.ts  # FR-6
│   │   ├── demo/setDemoMode.ts    # FR-6.4
│   │   └── partnerStatus/setStatus.ts  # FR-8
│   ├── actions/              # action。1関数1ファイル(CVX-20)
│   │   ├── garmin/syncDaily.ts    # FR-6.3 "use node"(Nodeランタイムはこのファイルに隔離, CVX-06)
│   │   ├── fasting/advancePhase.ts  # §4.2 scheduler専用internalMutation
│   │   ├── sessions/autoAbandon.ts  # FR-2.7 internalMutation
│   │   └── demo/tick.ts             # FR-6.4 internalMutation自己再帰
│   ├── services/              # ビジネスロジック層(ctx第1引数, CVX-02)+ 純粋関数(CVX-09)。1関数1ファイル
│   │   ├── users/{ensureUser,viewer}.ts
│   │   ├── sessions/{start,pause,resume,complete,elapsed}.ts  # elapsedは純粋関数
│   │   ├── blocks/{declare,erode,reschedule,suggestRescheduleSlots}.ts  # suggestRescheduleSlotsは純粋関数
│   │   ├── correlations/pearson.ts  # 純粋関数
│   │   └── demo/nextDemoMetric.ts   # 純粋関数
│   └── lib/                 # 横断的ユーティリティ(ドメイン分割の対象外): requireUser / requireSelf(CVX-04, FR-9.4)、JST日付ヘルパ、共有validator(CVX-16)
├── src/
│   ├── router.tsx           # ConvexQueryClient 統合(公式Quickstart準拠)
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── login.tsx        # ログイン(FR-9.1)
│   │   ├── signup.tsx       # サインアップ(FR-9.3)
│   │   ├── _authenticated.tsx   # 認証ガード(未認証→/login)
│   │   └── _authenticated/
│   │       ├── index.tsx    # ライブボード(FR-1)
│   │       ├── study.tsx    # セッション+枠(FR-2/3)
│   │       ├── fasting.tsx  # 断食の現在状態+履歴(FR-4/4.5、両ロール閲覧・操作はself)
│   │       ├── _self.tsx    # roleガード(partner→ / +通知, FR-9.4)。**TanStack Routerはpathless layoutに子ルートが1つも無い状態を許容しない**(index.tsx等と "/" が衝突しビルドエラーになる)。health/insights/settingsのうち最初の1つと**同じ変更でセットで追加**すること。単独では作らない
│   │       └── _self/
│   │           ├── health.tsx    # メトリクス+HIIT+断食詳細(FR-4/6)
│   │           ├── insights.tsx  # 相関ビュー(FR-7)
│   │           └── settings.tsx  # デモモード、犬プロフィール、断食目標(隠し: 分単位)
│   └── components/
└── docs/(requirements.md / spec.md / demo-script.md)
```

## 3. データモデル(convex/schema.ts)

方針: 「生きた状態」を持つテーブル(activeなsession / fastingWindow / partnerStatus)と、確定履歴テーブルを分けない。**同一ドキュメントの status フィールド遷移で表現**し、リアクティブ購読の対象を単純化する。

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ※実装時は先頭に Convex Auth の authTables(@convex-dev/auth/server)を spread する: ...authTables
  // 認証ID(Convex Auth ユーザー)とアプリロールの対応
  appUsers: defineTable({
    authSubject: v.string(), // Convex Auth user id(getAuthUserId の値)
    role: v.union(v.literal("self"), v.literal("partner")),
    displayName: v.string(),
  }).index("by_subject", ["authSubject"]),

  // FR-2 学習セッション(ライブ状態そのもの)
  studySessions: defineTable({
    userId: v.id("appUsers"),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("abandoned"),
    ),
    category: v.union(
      v.literal("eikaiwa"),
      v.literal("toeic"),
      v.literal("reading"),
      v.literal("other"),
    ),
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
    reason: v.union(v.literal("work"), v.literal("dog"), v.literal("chore"), v.literal("other")),
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
    status: v.union(
      v.literal("planned"),
      v.literal("done"),
      v.literal("eroded"),
      v.literal("rescheduled"),
      v.literal("declined"), // リスケしない選択(FR-3.7)
    ),
    erosionReason: v.optional(
      v.union(
        v.literal("work"),
        v.literal("fatigue"),
        v.literal("interruption"),
        v.literal("other"),
      ),
    ),
    rescheduledToId: v.optional(v.id("studyBlocks")), // リスケ先リンク(FR-3.3)
    source: v.union(v.literal("manual"), v.literal("suggested")), // FR-3.5
  }).index("by_user_date", ["userId", "dateJst"]),

  // FR-4 断食ウィンドウ(ステートマシン)
  fastingWindows: defineTable({
    userId: v.id("appUsers"),
    status: v.union(v.literal("fasting"), v.literal("ended")),
    phase: v.union(
      v.literal("early"), // 開始〜12h
      v.literal("fatburn"), // 12h〜目標
      v.literal("goal"),
    ), // 目標到達後
    startedAt: v.number(),
    targetMinutes: v.number(), // 既定 960(=16h)。デモ用に分指定可(AC-2)
    endedAt: v.optional(v.number()),
    actualMinutes: v.optional(v.number()),
    phaseJobIds: v.array(v.id("_scheduled_functions")), // 終了時に全キャンセル(FR-4.3)
  }).index("by_user_status", ["userId", "status"]),

  // FR-5 犬ケアイベント(当日の済/未は当日イベント有無から導出)
  dogEvents: defineTable({
    kind: v.union(
      v.literal("walk_am"),
      v.literal("walk_pm"),
      v.literal("meal_am"),
      v.literal("meal_pm"),
      v.literal("meds"),
      v.literal("toilet"),
      v.literal("other"),
    ),
    byUserId: v.id("appUsers"),
    at: v.number(),
    dateJst: v.string(),
    note: v.optional(v.string()),
  }).index("by_date", ["dateJst"]),

  // FR-6 日次健康メトリクス(本人のみ)
  healthMetrics: defineTable({
    dateJst: v.string(),
    source: v.union(v.literal("garmin"), v.literal("manual"), v.literal("demo")),
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
    kind: v.union(v.literal("hiit"), v.literal("walk"), v.literal("other")),
    at: v.number(),
    dateJst: v.string(),
    durationMinutes: v.number(),
    perceivedIntensity: v.optional(v.number()), // 1-10
  }).index("by_date", ["dateJst"]),

  // FR-8 パートナーステータス(ユーザーごとに最新1件をpatch更新)
  presence: defineTable({
    userId: v.id("appUsers"),
    state: v.union(
      v.literal("home"),
      v.literal("office"),
      v.literal("commuting_home"),
      v.literal("out"),
      v.literal("sleeping"),
    ),
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
```

## 4. 状態遷移定義(正)

### 4.1 studySessions(FR-2)

```
(なし) --start(category, planned?, blockId?)--> active
active --pause(reason)--> paused        [interruptions に1行作成、accumulatedMs += now-lastResumedAt]
paused --resume()--> active             [interruption.resumedAt 記録、lastResumedAt=now]
active|paused --complete()--> completed [accumulated確定、blockId あれば block.status=done]
active|paused --(scheduler 6h)--> abandoned   // FR-2.7、start時に runAfter で予約、complete/pauseで再スケジュール方針は「startから6h固定」で簡略化して良い
```

ガード: `by_user_status` で active|paused が既に存在する場合、start は ConvexError("SESSION_EXISTS")。
経過時間の導出(クライアント共通ヘルパ): `elapsed = accumulatedMs + (status==="active" ? now - lastResumedAt : 0)`。表示は1秒ローカルtickで良いが、**基準値は常にサーバドキュメント**。

### 4.2 fastingWindows(FR-4)

```
start(targetMinutes=既定960):
  insert {status:"fasting", phase:"early", startedAt:now}
  jobs = [ scheduler.runAfter(12h相当, internal.fasting.advancePhase, {id, to:"fatburn"}),
           scheduler.runAfter(target,   internal.fasting.advancePhase, {id, to:"goal"}) ]
  ※ targetMinutes < 720 の場合(デモ短縮)、fatburn ジョブは target の半分の時点に置く
advancePhase(internalMutation): 対象がまだ status=="fasting" のときのみ phase を更新
end(): status="ended", actualMinutes確定, phaseJobIds を全て scheduler.cancel
```

アクティブは同時に1つ(ガードは sessions と同様)。

### 4.3 studyBlocks(FR-3)

```
planned --erode(reason)--> eroded --reschedule(startHm,endHm)--> (新block planned, source="manual", 元blockに rescheduledToId)
planned --(紐づくsession complete)--> done
eroded --decline()--> declined --undoDecline()--> eroded (FR-3.7, 確認ダイアログ経由・取り消し可能)
```

リスケ候補の提示ロジック(サーバquery): 当日の残り時間帯(now以降〜22:00)から、既存planned枠と重ならない30分刻みの開始候補を最大5件返す。単純実装で良い。

## 5. Convex関数一覧(責務の正)

表記: q=query, m=mutation, im=internalMutation, a=action("use node"), ia=internalAction。**全public関数は (1) args validator(CVX-03) (2) 冒頭で `requireUser(ctx)`(lib/auth, CVX-04) を必須とし、ロジック本体は `convex/services/<ドメイン>/` に置く(CVX-02)。schedulerとcronsの参照先はすべてinternal(CVX-05)。queryは`Date.now()`を使わず、日付・現在時刻依存の値はすべて引数で受ける(CVX-14)。self専用ドメイン(health / correlations / demo)のpublic関数は `requireUser` に代えて `requireSelf(ctx)` を使う(FR-9.4)。**

下表の「ドメイン」列は `convex/{queries,mutations,actions}/<ドメイン>/<関数名>.ts` の `<ドメイン>` にあたる(CVX-20、1関数1ファイル)。例: `users` ドメインの `ensureUser`(m)は `convex/mutations/users/ensureUser.ts`、ロジック本体は `convex/services/users/ensureUser.ts`。

| ドメイン      | 関数                              | 種別           | 内容                                                                                                                                                                                                                                                                                                                                                        |
| ------------- | --------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| users         | ensureUser                        | m              | サインアップ/初回ログイン後にauthSubjectからappUsers解決。**存在しなければ args の role・displayName で新規作成(オープンサインアップ, FR-9.3)**。冪等。roleは共有validator(CVX-16)。`viewer`(q)は現在のappUser(or null)を返しクライアントのroleガードに使う                                                                                                 |
| dashboard     | live                              | q              | ライブボード用集約。**args: { dateJst }(クライアントがJSTで丸めた当日を渡す=CVX-14)**。自分+相手のpresence、activeセッション(経過計算用フィールドごと)、activeな断食、当日dogEvents集計、当日healthMetrics、当日blocks宣言vs実績。**1クエリで返す**(整合スナップショット+購読1本のデモ的美しさのため)。日付跨ぎはクライアントが日付変化を検知して引数を更新 |
| sessions      | start / pause / resume / complete | m              | §4.1                                                                                                                                                                                                                                                                                                                                                        |
| sessions      | autoAbandon                       | im             | FR-2.7                                                                                                                                                                                                                                                                                                                                                      |
| sessions      | current                           | q              | 自分の active                                                                                                                                                                                                                                                                                                                                               | paused セッション+interruptions |
| blocks        | declare / erode / reschedule      | m              | §4.3                                                                                                                                                                                                                                                                                                                                                        |
| blocks        | todayWithSuggestions              | q              | **args: { dateJst, nowHm }**(CVX-14)。当日枠一覧+リスケ候補(候補算出は services/blocks/suggestRescheduleSlots.ts の純粋関数, CVX-09)                                                                                                                                                                                                                        |
| fasting       | start / end                       | m              | §4.2                                                                                                                                                                                                                                                                                                                                                        |
| fasting       | advancePhase                      | im             | §4.2(scheduler専用, CVX-05)                                                                                                                                                                                                                                                                                                                                 |
| dog           | logEvent / undoEvent              | m              | FR-5。undoは当日の自分or相手の記録を削除可                                                                                                                                                                                                                                                                                                                  |
| health        | upsertManual                      | m              | FR-6.2(dateJst指定、source="manual")                                                                                                                                                                                                                                                                                                                        |
| health        | range                             | q              | **args: { fromDateJst, toDateJst }**(CVX-14)。`by_date` 範囲条件で絞る(CVX-11)                                                                                                                                                                                                                                                                              |
| health        | logWorkout                        | m              | FR-6.5                                                                                                                                                                                                                                                                                                                                                      |
| garmin        | syncDaily                         | ia("use node") | garmin-connectで前日〜当日を取得→ **`internal.health.upsertFromSync` を1回だけ呼び、複数日分は配列で渡す(CVX-07)**。失敗時 syncLogs 記録。client露出しない                                                                                                                                                                                                  |
| health        | upsertFromSync                    | im             | actionからの一括書き込み口(配列引数、単一トランザクション, CVX-15)                                                                                                                                                                                                                                                                                          |
| demo          | setDemoMode                       | m              | ON: scheduler.runAfter(0, internal.demo.tick) を起動しjobId保存 / OFF: cancel+demoデータ削除                                                                                                                                                                                                                                                                |
| demo          | tick                              | im             | 疑似メトリクス1件書き込み(乱数ウォークは services/demo/nextDemoMetric.ts の純粋関数)→ demoMode継続中なら runAfter(20s, tick) で自己再帰(AC-3)                                                                                                                                                                                                               |
| partnerStatus | setStatus                         | m              | presence を upsert                                                                                                                                                                                                                                                                                                                                          |
| correlations  | sleepVsStudy                      | q              | **args: { fromDateJst, toDateJst }(既定28日ぶんをクライアントが指定, CVX-14)**。healthMetrics × studySessions(dateJst join)→ {date, sleepScore, bodyBattery, studyMinutes, hiit}[] とピアソン相関係数(純粋関数)。クエリ内joinのため元データ変更で自動再計算(FR-7.2)。取得はすべて `by_user_date` / `by_date` の範囲index条件(CVX-10/11)                     |
| crons.ts      | —                                 | crons          | ①garmin日次同期: JST6:30 = UTC21:30(前日)で `crons.daily`。②abandonedの掃除等は不要(scheduler個別予約で足りる)                                                                                                                                                                                                                                              |

## 6. フロントエンド仕様

- 統合: 公式Quickstartどおり `router.tsx` で `ConvexQueryClient` を `QueryClient` に接続し、ルートで `ConvexAuthProvider`(`@convex-dev/auth/react`)を巻く。データ取得は原則 `useSuspenseQuery(convexQuery(api.x.y, args))`(SSR初期描画→ブラウザでライブ購読に自動移行)。ミューテーションは `useConvexMutation`。
- デザイン: 全ルート(`/login` `/signup` 含む)は `docs/design/live-board.md` のデザイン言語(ダーク+JetBrains Mono+カードUI)に準拠する。
- ルート:
  - `/login` / `/signup`(未認証専用、認証済みは `/` へ): Formisch+valibotフォーム。signupは email / password(確認入力付き) / displayName / role(self|partner 自己選択)。成功後 `users.ensureUser` を呼ぶ(FR-9.1/9.3)。
  - `/`(ライブボード): `dashboard.live` を購読する3カード+今日の宣言vs実績バー。各カードにクイック操作(犬: 未項目のワンタップ、セッション: 開始/中断/再開、断食: 開始/終了、presence: 自分の状態変更)。**この画面だけでデモが完結する**ことを目標にする。
  - `/study`: 枠の宣言UI(時刻ピッカー)、枠一覧(planned/eroded/done)、侵食→リスケ候補選択、セッション詳細(中断内訳)。
  - `/fasting`: 断食の現在状態(フェーズタイムライン+経過/残り、開始/終了操作は self のみ)の拡大カードと、過去断食の簡易履歴(直近30件、編集・削除なし)(FR-4.5)。**注**: FR-4.4 の「セッション画面」はライブボードの `session-fasting-card`(セッションと断食が同居するカード)を指すものと解釈する。
  - `/health`: メトリクス推移(Recharts)、手動入力フォーム、HIIT記録、断食履歴、最終同期表示。
  - `/insights`: 相関ビュー(散布図2枚+相関係数、HIIT翌日比較)。
  - `/settings`: デモモードトグル(FR-6.4)、断食目標(分単位入力可=AC-2の短縮デモ用)、犬の名前。
  - 認可: `/health` `/insights` `/settings` は self 専用(FR-9.4)。partner がアクセスした場合は `/` へリダイレクト+通知を表示。共通レイアウトのユーザーメニューに logout(`signOut`)を置く。
- 経過時間表示: `useElapsed(session)` フック(1sローカルtick、基準はサーバ値)。タブ復帰時のズレはサーバ値由来なので自動補正される、という点を発表で言及できるようコメントを書く。
- モバイル: ライブボードは1カラム縦積み(NFR-2)。

## 7. 認証設計(FR-9)

> **2026-07-06改訂(v1.2)**: 発注者判断により (1) Clerk → Convex Auth(Password provider)、(2) 「2ユーザー固定・allow-list」を廃止し**オープンサインアップ**へ変更。実装手順の詳細は `docs/plans/2026-07-06-convex-auth.md`(Sonnet 5 実行用 plan)を正とする。

- プロバイダ: Convex Auth(`@convex-dev/auth`)+ **Password provider のみ**(OAuth / Magic Link / OTP なし)。
- サインアップ(FR-9.3): `/signup` で email + password + displayName + role(self/partner の自己選択)を登録。**allow-list なし、即時有効**。`ensureUser` は未知の authSubject を拒否せず appUsers 行を新規作成する(冪等)。
- パスワードポリシー: 12文字以上+英大文字・小文字・数字を含む(Password provider の `validatePasswordRequirements` で実装、クライアント側 valibot でも同等の検証)。確認入力フィールドあり。**パスワードリセット・メール検証はスコープ外**。
- ログイン/ログアウト: 未認証アクセスは `/login` へリダイレクト(FR-9.1)。logout は共通レイアウトのユーザーメニューから `signOut`。
- 認可(FR-9.4): self 専用ルート(`/health` `/insights` `/settings`)は role ガード。partner がアクセスした場合は `/` へリダイレクト+通知。サーバ側も `requireSelf(ctx)`(lib/auth)で二重に防御する。
- サーバ側検証(FR-9.2): 全 public 関数の冒頭で `requireUser(ctx)`(CVX-04)。`getAuthUserId(ctx)` → appUsers 解決、未認証は `ConvexError("UNAUTHENTICATED")`。
- スキーマ: `convex/schema.ts` の先頭に `...authTables`(`@convex-dev/auth/server`)を spread。`appUsers.authSubject` は Convex Auth のユーザーIDに対応。
- 環境変数: dev deployment のみセットアップ(`@convex-dev/auth` CLI で `SITE_URL` / `JWT_PRIVATE_KEY` / `JWKS`)。本番反映は plan §6 のチェックリストを発表前に実施。

## 8. Garmin連携詳細(FR-6.3)

- 環境変数: `GARMIN_EMAIL`, `GARMIN_PASSWORD`(MFA有効なら `GARMIN_OAUTH1_JSON`, `GARMIN_OAUTH2_JSON` を優先使用)。
- 実装: `convex/garmin.ts` 冒頭 `"use node";`。`garmin-connect` でログイン(またはトークン復元)→ 睡眠・Body Battery・HRV・歩数・安静時心拍のdaily値を取得 → `upsertFromSync`。
- 取得APIの正確なメソッド名はライブラリの現行ドキュメントを実装時に確認する(非公式ゆえ変動しうる)。取得できない項目はundefinedのまま保存して良い。
- 失敗時: syncLogsに記録し、例外は握りつぶす(cronを止めない)。UIは「最終同期: x時間前(失敗)」表示+手動入力導線(FR-6.2)。
- トークン失効(約90日)時の再生成手順をREADMEに記載する。
- **リスク受容**: 非公式APIのため恒久動作は保証されない。壊れた場合は手動+デモモードで運用継続(発注者合意済み)。

## 9. デモ設計(発表当日)

- `docs/demo-script.md` を作り、以下のシーケンスを固定する:
  1. 2端末でライブボードを表示(self=PC、partner=スマホ)。
  2. partner端末で「犬: 夜ごはん」をタップ → self端末の未→済が即時変化(他人駆動)。
  3. self端末でTOEICセッション開始 → partner側に「勉強中 00:00…」出現。スマホから中断(犬) → PC側が一時停止(自分駆動・マルチデバイス)。
  4. 断食目標を「2分」に設定して開始 → 待つだけで両端末のフェーズ表示が goal に切替(時間駆動、AC-2)。
  5. 設定でデモモードON → 無操作でグラフが動く(外部駆動、AC-3)。
  6. insightsを開き、健康データを1件手動追加 → 散布図と相関係数がその場で再計算(リアクティブjoin)。
- 各シーンを事前録画し、資料に埋め込む(NFR-6)。
- コード解説スライドの推奨2箇所: `fasting.ts`(schedulerによるサーバ側状態遷移)と `correlations.ts`(join導出のリアクティブ再計算)。

## 10. コーディング規約・Lint・テスト

- **規約本体は `convex-rules.md`(CVX-01〜20)。** 本節は本プロジェクト固有の適用ポイントの再掲のみ。
- W1のscaffold時点でESLintを導入する(CVX-18): `@convex-dev` ルール(`no-filter-in-query`, `require-argument-validators`, `explicit-table-ids`)+ typescript-eslint `no-floating-promises`(CVX-17)。`npm run lint` をコミット前チェックにする。
- `ctx.db.get/patch/replace/delete` は必ずテーブル名第1引数の形式(CVX-13)。
- 共有enumは `lib/validators.ts` に `categoryValidator` / `dogEventKindValidator` / `presenceStateValidator` 等として定義し、`Infer` で型を導出。フロントの選択肢UIもこの型から生成する(CVX-16)。
- テスト(CVX-19): `convex-test` + `convexTest(schema)` + `t.withIdentity(...)`。最低限の対象: ①二重start拒否(sessions/fasting) ②ended後の `advancePhase` が無視されること ③`model/` の純粋関数(経過時間導出、リスケ候補、ピアソン相関、乱数ウォーク)。
- レビュー時は `convex-rules.md` 末尾のチェックリストを使う。

## 11. 未決事項(実装中に発注者へ確認)

- OD-1 アプリ正式名称(仮: Life Pulse)。
- OD-2 犬のケア項目の確定リスト(薬の有無・頻度)。
- OD-3 ~~Clerk か Better Auth か~~ → **解決済み(2026-07-06)**: Convex Auth(Password provider)+オープンサインアップに決定。§7 および `docs/plans/2026-07-06-convex-auth.md` 参照。
- OD-4 妻用UIの言語・トーン(日本語UI前提で良いか)。
