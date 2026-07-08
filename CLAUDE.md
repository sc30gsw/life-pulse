@AGENTS.md

## Current Implementation Status

Update this section as implementation progresses. Fine-grained progress lives in `docs/phases.md` (FR-x.y checkboxes) — this section is a high-level snapshot only.

- **W1 (土台) + W2 (学習セッション+枠)**: done. Auth (Convex Auth Password, open signup), live board (self/partner/dog cards on real Convex subscriptions), dog quick actions + history modal (FR-5.4), partner presence, the full study-session state machine (start/pause/resume/complete + 6h autoAbandon via scheduler), study blocks (FR-3 declare/erode/reschedule + suggestRescheduleSlots), the `/study` route (declare form, block list with erode→reschedule flow, start-from-block, FR-2.8 session history with interruption-reason breakdown), and the UserMenu nav link to `/study`.
- **W3 PR1 (断食)**: done. Fasting state machine (start/end mutations + `advancePhase` scheduled-function phase transitions, appSettings-fallback `targetMinutes`), live board fasting operation buttons (start/end, self only), and the `/fasting` route (expanded current-state card + phase timeline + window history list).
- **W3 PR2 (健康+デモ)**: done. Health metrics manual input (`health.upsertManual`, `source="manual"`, same-day upsert), demo mode (`demo.setDemoMode` + self-rescheduling `tick` on a 20s interval, 15-day metric seed on enable, full job-cancel + `source="demo"` row deletion on disable), HIIT workout CRUD (`health.logWorkout`/`updateWorkout`/`deleteWorkout`), the `/health` route (metrics trend charts + manual-entry form + HIIT tracking list), the `/settings` route (demo-mode toggle, fasting default minutes, dog name), the `_self.tsx` role guard shared by both routes, and UserMenu links to `/health`/`/settings`.
- **Not yet implemented**: correlations (FR-7), Garmin sync (FR-6.3).
- **Stack actually in use**: TanStack Start + Convex + `@convex-dev/react-query` (`useSuspenseQuery(convexQuery(...))` / `useConvexMutation`) + Mantine (core/dates/modals/notifications) + Tailwind v4 (via `tailwind-preset-mantine`) + Valibot + Formisch + dayjs + Remeda + oxfmt/oxlint — all accessed via `vp`.
- Convex functions follow the 3-layer split: `convex/{queries,mutations}/<domain>/<fn>.ts` (thin, validated, `requireUser`) + `convex/services/<domain>/<fn>.ts` (logic, tested via convex-test). See `.claude/rules/convex-rules.md`.
- The canonical technical specification is `docs/spec.md`; the product requirements are in `docs/requirements.md`.
