@AGENTS.md

## Current Implementation Status

Update this section as implementation progresses. Fine-grained progress lives in `docs/phases.md` (FR-x.y checkboxes) — this section is a high-level snapshot only.

- **W1 (土台) + W2 セッション操作**: done. Auth (Convex Auth Password, open signup), live board (self/partner/dog cards on real Convex subscriptions), dog quick actions + past-event history modal (FR-5.4), partner presence, and the full study-session state machine (start/pause/resume/complete + 6h autoAbandon via scheduler) are implemented and wired into the UI.
- **Not yet implemented**: study blocks (FR-3, declare/erode/reschedule + `/study` route), fasting (FR-4), health data input + demo mode (FR-6.2/6.4/6.5), correlations (FR-7), Garmin sync (FR-6.3), `/settings` and `/health` routes.
- **Stack actually in use**: TanStack Start + Convex + `@convex-dev/react-query` (`useSuspenseQuery(convexQuery(...))` / `useConvexMutation`) + Mantine (core/dates/modals/notifications) + Tailwind v4 (via `tailwind-preset-mantine`) + Valibot + Formisch + dayjs + Remeda + oxfmt/oxlint — all accessed via `vp`.
- Convex functions follow the 3-layer split: `convex/{queries,mutations}/<domain>/<fn>.ts` (thin, validated, `requireUser`) + `convex/services/<domain>/<fn>.ts` (logic, tested via convex-test). See `.claude/rules/convex-rules.md`.
- The canonical technical specification is `docs/spec.md`; the product requirements are in `docs/requirements.md`.
