# Life Pulse — フェーズ管理ロードマップ

- 目的: 発表(W4 末)までの実装フェーズをチェックボックスで管理する長命ドキュメント。
- 運用: 各フェーズの詳細手順は `docs/plans/YYYY-MM-DD-*.md`(使い捨て plan)に切り出し、ここからリンクする。**タスク完了時・plan 完了時に実装エージェントがこのファイルのチェックボックスを更新すること。**
- 参照: 要件 = `docs/requirements.md`、技術仕様 = `docs/spec.md`、Convex 規約 = `.claude/rules/convex-rules.md`(CVX-01〜20)

## ステータス凡例

- `[x]` 完了(main マージ済み)
- `[ ]` 未着手 / 進行中

---

## W1 — 土台(FR-9 / FR-1 骨格 / FR-5)

- [x] Scaffold(TanStack Start + Convex + Vite+)
- [x] FR-9 認証(Convex Auth Password / オープンサインアップ / requireUser・requireSelf)— PR #2
- [x] FR-1 ライブボード UI 骨格(fixtures 駆動、デザイン: `docs/design/live-board.md`)
- [ ] **auth フロントエンドテスト追加(Phase 0)** → [2026-07-07-live-board-wiring.md](./plans/2026-07-07-live-board-wiring.md)
- [ ] **schema.ts 全テーブル確定(spec §3)(Phase 1)** → 同上
- [ ] **dashboard.live クエリ + FR-5 犬 mutations + FR-8 presence mutation(Phase 2)** → 同上
- [ ] **ライブボード実配線(fixtures → Convex 購読、段階的削除)(Phase 3)** → 同上
- [ ] **検証 + PR(Phase 4)** → 同上

## W2 — 学習セッション + 枠(FR-2 / FR-3)

- [ ] FR-2 sessions: start / pause / resume / complete mutations + current クエリ(§4.1 ステートマシン、二重 start 拒否)
- [ ] FR-2.7 autoAbandon(scheduler、6h)
- [ ] FR-3 blocks: declare / erode / reschedule + todayWithSuggestions(リスケ候補は純関数)
- [ ] `/study` ルート(枠宣言 UI・侵食→リスケ)
- [ ] ライブボードのセッション操作ボタン配線(W1 では表示のみ・disabled)

## W3 — 断食 + 健康データ + デモモード(FR-4 / FR-6.2 / FR-6.4 / FR-6.5)

- [ ] FR-4 fasting: start / end + advancePhase(scheduler 時限遷移、AC-2 分単位短縮対応)
- [ ] ライブボードの断食操作ボタン配線
- [ ] FR-6.2 健康データ手動入力(health.upsertManual + `/health` ルート、`_self.tsx` role ガードと同時追加 — spec §2 の注意書き参照)
- [ ] FR-6.4 デモモード(demo.setDemoMode + tick 自己再帰、AC-3)
- [ ] FR-6.5 HIIT 記録(health.logWorkout)
- [ ] `/settings`(デモモードトグル・断食目標・犬の名前)

## W4 — 外部連携 + 相関 + 磨き込み(FR-6.3 / FR-7)

- [ ] FR-6.3 Garmin 実連携("use node" action + cron JST6:30、失敗時 syncLogs)— 難航時は打ち切り可(P1)
- [ ] FR-7 相関ビュー(correlations.sleepVsStudy + `/insights`、pearson 純関数)
- [ ] UI 磨き込み・モバイル 375px 検証(NFR-2)
- [ ] デモ録画(AC-5)+ `docs/demo-script.md`
- [ ] 本番デプロイ + 本番環境変数チェックリスト(spec §7)

## 横断タスク

- [ ] `CLAUDE.md` の「Current Implementation Status」を各フェーズ完了時に更新
- [ ] `.claude/rules/common/testing.md` を Testing Library 導入後に更新(Phase 0 に含む)
