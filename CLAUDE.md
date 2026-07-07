@AGENTS.md

## Current Implementation Status

Update this section as implementation progresses. Fine-grained progress lives in `docs/phases.md` (FR-x.y checkboxes) — this section is a high-level snapshot only.

- **W1 (土台) + W2 (学習セッション+枠)**: done. Auth (Convex Auth Password, open signup), live board (self/partner/dog cards on real Convex subscriptions), dog quick actions + history modal (FR-5.4), partner presence, the full study-session state machine (start/pause/resume/complete + 6h autoAbandon via scheduler), study blocks (FR-3 declare/erode/reschedule + suggestRescheduleSlots), the `/study` route (declare form, block list with erode→reschedule flow, start-from-block, FR-2.8 session history), and the UserMenu nav link to `/study`.
- **Not yet implemented**: fasting (FR-4), health data input + demo mode (FR-6.2/6.4/6.5), correlations (FR-7), Garmin sync (FR-6.3), `/settings` and `/health` routes.
- **Stack actually in use**: TanStack Start + Convex + `@convex-dev/react-query` (`useSuspenseQuery(convexQuery(...))` / `useConvexMutation`) + Mantine (core/dates/modals/notifications) + Tailwind v4 (via `tailwind-preset-mantine`) + Valibot + Formisch + dayjs + Remeda + oxfmt/oxlint — all accessed via `vp`.
- Convex functions follow the 3-layer split: `convex/{queries,mutations}/<domain>/<fn>.ts` (thin, validated, `requireUser`) + `convex/services/<domain>/<fn>.ts` (logic, tested via convex-test). See `.claude/rules/convex-rules.md`.
- The canonical technical specification is `docs/spec.md`; the product requirements are in `docs/requirements.md`.
