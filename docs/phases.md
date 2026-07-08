# Life Pulse — フェーズ管理ロードマップ

- 目的: 発表(W4 末)までの実装フェーズを **requirements.md の FR-x.y / AC-x と同期した** チェックボックスで管理する長命ドキュメント。
- 運用:
  - チェックポイントは `docs/requirements.md` の受け入れ条件(FR-x.y)を正とする。**要件を増減する場合は requirements.md を先に改訂し、本ファイルを追従させる。**
  - 各フェーズの詳細手順は `docs/plans/YYYY-MM-DD-*.md`(使い捨て plan)に切り出し、各項目からリンクする。**タスク完了時・plan 完了時に実装エージェントがこのファイルのチェックボックスを更新すること。**
  - 「今どの段階か」= 未チェックの最初の週。「どこまでできているか」= FR-x.y 単位のチェック状態。
- 参照: 要件 = `docs/requirements.md`、技術仕様 = `docs/spec.md`、Convex 規約 = `.claude/rules/convex-rules.md`(CVX-01〜20)

## ステータス凡例

- `[x]` 完了(main マージ済み)
- `[ ]` 未着手 / 進行中
- 部分完了は `[ ]` のまま「⏳」注記で残依存 FR を明示する

---

## W1 — 土台(FR-9 / FR-1 骨格 / FR-5 / FR-8)

plan: [2026-07-07_01-live-board-wiring.md](./plans/2026-07-07_01-live-board-wiring.md)(初回分マージ済み。**FR-5.4 / FR-1.6 の残タスクは W2 plan [2026-07-07_02-study-sessions.md](./plans/2026-07-07_02-study-sessions.md) に移管**)

### FR-9 認証・アカウント【P0】— PR #2

- [x] FR-9.1 認証必須。未認証は `/login` へリダイレクト
- [x] FR-9.2 全 Convex 関数がサーバ側で認証検証(requireUser)
- [x] FR-9.3 オープンサインアップ(email+パスワード 12 文字以上・英大小・数字+表示名+ロール自己選択)
- [x] FR-9.4 self 専用ページ(`/health` `/insights` `/settings`)の role ガード+サーバ側 requireSelf

### FR-1 ライブボード【P0】

- [x] FR-1.1 本人/パートナー/犬の 3 カード表示・全カードリアルタイム更新(fixtures → Convex 購読へ実配線済み)
- [x] FR-1.2 本人カードの全指標(学習セッション状態・断食状態・Body Battery/睡眠・宣言 vs 実績)
- [x] FR-1.3 パートナーカード(ステータス+最終更新時刻)
- [x] FR-1.4 犬カード(当日ケア項目の済・未+実施者・時刻)
- [x] FR-1.5 self / partner どちらでも同一内容を閲覧可能
- [ ] FR-1.6 2 端末で <1s 反映のデモ検証 ⏳ 実装は W2 plan §7 分含め完了。**2 ブラウザ実機検証は未実施**(AC-1 ゲートで最終確認)

### FR-5 犬のクイックアクション【P0】

- [x] FR-5.1 定義済みケア項目のワンタップ記録(実施者・時刻自動付与)
- [x] FR-5.2 記録・取り消しが両ユーザーから可能・即時反映(logEvent / undoEvent)
- [x] FR-5.3 未実施項目の視覚強調+二重実施の UI 抑止
- [x] FR-5.4 過去日履歴の簡易リスト(P1)(dog.history query + 犬カード履歴モーダル、W2 plan §3.5 で実装)

### FR-8 パートナーステータス【P0】

- [x] FR-8.1 状態(在宅/出社中/帰宅中+ETA/外出/就寝)のワンタップ+任意 ETA 更新
- [x] FR-8.2 本人ライブボードへ即時反映(履歴は当日分)

## W2 — 学習セッション + 枠(FR-2 / FR-3)

plan: [2026-07-07_02-study-sessions.md](./plans/2026-07-07_02-study-sessions.md)(PR1: セッション操作+FR-5.4 完了。PR2: FR-3 blocks+`/study`+FR-2.8 も実装完了)

### FR-2 学習ライブセッション【P0】

- [x] FR-2.1 サーバ側ステートマシン(idle → active ⇄ paused → completed / abandoned)
- [x] FR-2.2 開始時にカテゴリ+任意目標分数を指定、宣言済み枠(FR-3)へ紐づけ可能(`/study` の「この枠で開始」で blockId 連携)
- [x] FR-2.3 経過時間は `startedAt / accumulatedMs / lastResumedAt` からサーバ値で導出(全デバイス同一値)
- [x] FR-2.4 ワンタップ中断(理由: 仕事/犬/家事/その他)+どのデバイスからも操作・即時反映
- [x] FR-2.5 アクティブ同時 1 つ制約(既存アクティブ時の start 拒否/誘導、`SESSION_EXISTS`)
- [x] FR-2.6 完了時に実績分数・中断回数・中断内訳を確定保存
- [x] FR-2.7 放置 6h で scheduled function が abandoned に自動遷移(autoAbandon、convex-test で検証済み)
- [x] FR-2.8 過去セッション履歴の簡易リスト(P1、v1.3 追加)(sessions.history query + `/study` の履歴セクション、直近 7 日。中断要因の内訳併記 = v1.4 補足、interruptions join)

### FR-3 学習枠の宣言と防衛(Lv2)【P0】

- [x] FR-3.1 日単位で枠(開始・終了時刻、カテゴリ、予定分数)を複数宣言(blocks.declare、plannedMinutes はサーバ導出)
- [x] FR-3.2 planned → done / eroded(理由付き) / rescheduled / declined の遷移(done はセッション complete 連動)
- [x] FR-3.3 侵食時に当日残り時間帯からリスケ候補提示→選択で新枠生成(元枠リンク保持、suggestRescheduleSlots 純関数)
- [x] FR-3.4 「宣言 vs 実績」当日サマリがライブボードに表示(FR-1.2 の学習分を解消)
- [x] FR-3.5 スキーマに `source: "manual" | "suggested"` を保持
- [x] FR-3.6 未来日の枠宣言(開始日時・終了日時の DateTimePicker、同日+過去日拒否)、予定一覧(今日超〜30日)、planned 枠の編集/物理キャンセル、日本の祝日表示(土曜は青、日曜・祝日は赤)
- [x] FR-3.7 侵食枠に「リスケしない」ボタン追加(ConfirmDialog経由でdecline、eroded→declined)。declinedは「元に戻す」でeroded復帰可能(undoDecline、確認不要)
- [x] FR-2.2 残タスク: 宣言ブロックからのセッション開始導線(`/study` の「この枠で開始」)

### UI 配線

- [x] `/study` ルート(枠宣言 UI・予定一覧・予定編集/キャンセル・侵食→リスケ・セッション履歴。導線は UserMenu の「学習管理」)
- [x] ライブボードのセッション操作ボタン配線(開始/中断/再開/完了、Mantine modal でカテゴリ+目標分入力)

## W3 — 断食 + 健康データ + デモモード(FR-4 / FR-6.2 / FR-6.4 / FR-6.5)

**2 本の plan に分割する(W2 の PR1/PR2 分割と同じ方針)。実装順序は PR1 → PR2。**

- PR1: 断食(FR-4)— plan: [2026-07-07_03-fasting.md](./plans/2026-07-07_03-fasting.md)(`/fasting` ページ新設・appSettings 読み取りfallback 等の合意事項は plan §0 参照)
- PR2: 健康データ手動入力 + デモモード + HIIT(FR-6.2 / FR-6.4 / FR-6.5)— plan: [2026-07-07_04-health-demo.md](./plans/2026-07-07_04-health-demo.md)

### FR-4 断食ステートマシン【P0】(PR1)

- [x] FR-4.1 「断食開始」で eating → fasting。`targetMinutes` は開始時に任意指定、省略時は `appSettings.fastingDefaultMinutes`(既定 960 分)(v1.2 補足)
- [x] FR-4.2 フェーズ遷移は scheduled function がサーバ側で書き換え(ポーリング禁止)。AC-2 のデモ短縮は開始時の `targetMinutes` 指定だけで実現(専用の隠し設定画面は不要、v1.2 補足)
- [x] FR-4.3 「食事開始」で実績確定+予約済み未来遷移ジョブのキャンセル。断食中でない状態での終了操作は無視/エラー(v1.2 補足、FR-2 の二重操作ガードと同方針)
- [x] FR-4.4 ライブボード+セッション画面に経過・現フェーズ・残りを常時表示(FR-1.2 の一部を解消)
- [x] FR-4.5 専用ページ `/fasting`(両ロール閲覧・操作は self)で現在状態と過去断食の簡易履歴を閲覧できる(`/fasting` ルート + `queries/fasting/history`)

### FR-4 UI 配線(PR1)

- [x] ライブボードの断食操作ボタン配線(開始/終了)

### FR-6 健康データ流入(手動+デモ)【P0】(PR2)

- [x] FR-6.1 日次メトリクス(睡眠スコア/睡眠時間/Body Battery/HRV/安静時心拍/歩数、本人のみ)のスキーマ・表示
- [x] FR-6.2 手動入力 UI(health.upsertManual + `/health` ルート、source="manual"、`_self.tsx` role ガード同時追加 — spec §2 注意書き)。同日再入力は upsert、全項目任意入力(v1.2 補足)
- [x] FR-6.4 デモモード(demo.setDemoMode + tick 自己再帰、source="demo" 分離、間隔 20 秒 = NFR-5 の ≥15s を満たす)。OFF で自動的にジョブ cancel + demo データ一括削除(専用削除ボタンなし、v1.2 補足)
- [x] FR-6.5 HIIT 記録(health.logWorkout、種別・時刻・時間・主観強度。時刻は既定で現在時刻、後から編集可)

### FR-6 UI 配線(PR2)

- [x] `/settings`(デモモードトグル・断食目標・犬の名前)(`_self/settings.tsx` + `features/settings/` の DemoModeSwitch / SettingsForm、テスト込み)

## W4 — 外部連携 + 相関 + 磨き込み(FR-6.3 / FR-7)

- PR1: Garmin 実連携(FR-6.3)— plan: [2026-07-07_05-garmin-sync.md](./plans/2026-07-07_05-garmin-sync.md)
- PR2: 相関ビュー(FR-7)— plan: 未作成

### FR-6.3 Garmin 実連携【P1 — 難航時は打ち切り可】

- [ ] FR-6.3 `garmin-connect-sdk@1.0.0-alpha.4`(完全固定、`^` 禁止)+ "use node" action + cron(JST 6:30)、認証情報は Convex 環境変数のみ(NFR-4)、失敗は syncLogs+「最終同期」表示
  - 前提: `convex.json` で Node 24 を指定(SDK が `engines: >=24`。Convex は Node 20/22/24 対応・既定 20 — 公式 docs 確認済み)
  - MFA は SDK の `login({email, password, mfaCode})` で対応。トークンは `TokenStorage` 抽象のカスタム実装で環境変数から復元(旧 `GARMIN_OAUTH1_JSON`/`GARMIN_OAUTH2_JSON` 設計は SDK のトークン形式に合わせて再定義)
  - alpha のため自前の薄いラッパー(`GarminClient` インターフェース)越しに使用。退避先: `@gooin/garmin-connect@1.8.7`(要件 = requirements.md FR-6.3 v1.7 改訂参照)

### FR-7 相関ビュー【P1】

- [ ] FR-7.1 直近 28 日の「睡眠×学習分数」「Body Battery×学習分数」「HIIT 翌日 Body Battery」表示
- [ ] FR-7.2 Convex クエリ内 join で導出、元データ変更で自動再計算・再描画(`/insights`、pearson 純関数)
- 決定(2026-07-08): `/health` の HIIT トレンドチャート(`HiitTrend`)へ健康指標(睡眠/Body Battery 等)を area/line で重ねる案、および PieChart 追加案は本 FR-7 のスコープとし、`/health` 側では実装しない。`HiitTrend` は kind 別(hiit/walk/other)の stacked `BarChart` のみに留める。FR-7 実装時に `CompositeChart`(bar+area/line、`@mantine/charts`)採用を検討する。

### 磨き込み・発表準備

- [ ] UI 磨き込み・モバイル 375px 検証(NFR-2)
- [ ] デモ録画+ `docs/demo-script.md`(AC-5、NFR-6 のデモ失敗保険)
- [ ] 本番デプロイ + 本番環境変数チェックリスト(spec §7)

---

## 受け入れ基準ゲート(requirements.md §8 — 発表可能の定義)

各週の FR が揃ったら該当 AC を 2 ブラウザ実機で検証し、ここをチェックする。**AC-1〜5 が全て `[x]` になった時点で発表可能。**

| AC       | 内容                                                                                   | 依存 FR                        | 検証可能になる週                               |
| -------- | -------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------- |
| [ ] AC-1 | 片方の操作(セッション開始/中断、犬ごはん記録、ステータス更新)が他方に 1 秒以内に反映   | FR-1.6, FR-2.4, FR-5.2, FR-8.2 | W2(犬・ステータスは W1 済、セッション操作待ち) |
| [ ] AC-2 | 断食 16h 到達(開始時に短い `targetMinutes` を指定)で無操作のまま両画面のフェーズが切替 | FR-4.1〜4.3                    | W3 PR1                                         |
| [ ] AC-3 | デモモード ON で無操作のままグラフ/メトリクスが自動更新                                | FR-6.4                         | W3 PR2                                         |
| [ ] AC-4 | 枠の宣言→侵食→リスケの一連がワンタップ主体で完結                                       | FR-3.1〜3.3                    | W2                                             |
| [ ] AC-5 | AC-1〜3 の様子が録画済みで発表資料に埋め込める                                         | AC-1〜3 + デモ録画             | W4                                             |

## 横断タスク

- [x] `CLAUDE.md` の「Current Implementation Status」を各フェーズ完了時に更新
- [x] `.claude/rules/common/testing.md` を Testing Library 導入後に更新(W1 Phase 0 で完了)
- [ ] NFR-3 タイムゾーン検証(日付境界 = JST 0:00、cron の UTC 変換)— W3 の cron/scheduler 実装時に確認
