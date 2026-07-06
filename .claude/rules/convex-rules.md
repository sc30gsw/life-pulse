# Convex Implementation Rules (convex-rules.md)

- Version: v1.0 (2026-07-05)
- Status: This is the **required coding standard** for this project (Life Pulse), and it is the canonical, authoritative copy — `docs/convex-rules.md` is now only a short pointer to this file, not a separate source of truth. It is handed to implementation agents together with `requirements.md` / `spec.md`. The implementation of `spec.md` must always conform to the rules in this document (this file also serves as a review checklist).
- Sources: Convex official Best Practices / the official TypeScript guide / the Zenn article "Convexの設計思想と実装パターンの解説" (by taroosg). Each rule cites its source.

## 0. Reconciling the Sources (Important)

The Zenn article recommends a pattern where public functions handle only authentication and delegate business logic to `ctx.runMutation(internal.xxx)`. The official Best Practices guide, on the other hand, states that `ctx.runQuery` / `ctx.runMutation` inside a query/mutation carry extra overhead and should be used sparingly, and that shared logic should live in **plain TypeScript helper functions (`convex/model/`)**.

**This project treats the official guidance as authoritative:**

- The idea shared by both sources — "public functions should be thin, with logic in a separate layer" — is adopted (see CVX-02).
- However, the delegation mechanism is **direct calls to helper functions in `convex/model/`**, not `ctx.run*` (same transaction, lower overhead).
- `ctx.run*` may only be used for the exception cases covered by CVX-07 / CVX-08 (DB operations from an action, scheduler/crons, components, partial rollback).

---

## A. Function Design

### CVX-01: Use the Six Function Types Correctly 〔Zenn / Official〕

Use the six combinations of `query` / `mutation` / `action` × (public / internal), matching each to its responsibility.

- query: read-only, reactive, cacheable. No side effects.
- mutation: DB writes. One handler = one transaction (ACID).
- action: external APIs, long-running work. No direct DB access (goes through `ctx.run*`).
- Only make something a public function if the client calls it directly; make everything else `internalQuery` / `internalMutation` / `internalAction`.

### CVX-02: Public Functions Are a "Thin API Layer"; Logic Lives in `convex/model/` 〔Zenn + Official (reconciled)〕

A public function's responsibility is only these three things: (1) argument validation (declared via a validator), (2) authentication/authorization, and (3) calling a model-layer helper. Business logic, multi-table operations, and derived calculations belong in plain TypeScript functions in `convex/model/<domain>.ts` (which take `QueryCtx` / `MutationCtx` as their first argument).

```ts
// ✅ convex/sessions.ts (API layer: thin)
export const start = mutation({
  args: { category: categoryValidator, plannedMinutes: v.optional(v.number()),
          blockId: v.optional(v.id("studyBlocks")), dateJst: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);            // auth (CVX-04)
    return Sessions.start(ctx, user, args);          // delegate logic to model
  },
});
// ✅ convex/model/sessions.ts (logic layer)
export async function start(ctx: MutationCtx, user: Doc<"appUsers">, args: StartArgs) { ... }
```

### CVX-03: Attach an Argument Validator to Every Public Function 〔Official〕

Public functions can be called by anyone. Always declare `args: { ... }` with a validator (a return-value validator is also recommended). TypeScript type annotations alone are not enforced at runtime. This is enforced through manual review discipline: every `convex/` change must be checked against this file's checklist, and the `convex:convex-reviewer` subagent should be run on `convex/` code before merging.

### CVX-04: Add Access Control to Every Public Function 〔Official / Zenn〕

At the start of every public function, perform verification based on `ctx.auth.getUserIdentity()`. In this project, every public function must call `requireUser(ctx)` from `convex/lib/auth.ts` (it throws for an unauthenticated or unregistered subject). **Never use spoofable arguments (email, role, isAdmin, etc.) for authorization decisions.** Authorization is based on the `role` on `appUsers`, resolved server-side.

### CVX-05: Only Call `internal` Functions from scheduler / crons 〔Official〕

The targets of `ctx.scheduler.runAfter/runAt` and `crons.ts` must always be `internal.xxx`. Never pass `api.xxx` (public functions assume authentication). Make it a review point that `api` from `_generated/api` is never imported inside the Convex functions directory.
Applies to this project: `fasting.advancePhase`, `sessions.autoAbandon`, `demo.tick`, and `garmin.syncDaily` are all internal.

### CVX-06: Only Use `runAction` When the Runtime Differs 〔Official〕

For processing within the same runtime, extract it into a plain TypeScript function and call it directly. Use `ctx.runAction` only when calling Node.js runtime (`"use node"`) code from the Convex runtime.
Applies to this project: `garmin.ts` is `"use node"`. Since the cron directly schedules `internal.garmin.syncDaily` (an internalAction), `runAction` is generally unnecessary.

### CVX-07: Avoid Sequential `ctx.runQuery` / `ctx.runMutation` Calls Inside an action 〔Official〕

Each `ctx.run*` call is an independent transaction. Calling them back-to-back with no intervening side effect (such as an external API call) is a breeding ground for inconsistency. Bundle reads into a single internalQuery and writes into a single internalMutation (pass an array and loop on the mutation side).
Applies to this project: `garmin.syncDaily` is structured as "fetch → call `internal.health.upsertFromSync` **once** (passing multiple days as an array)".

### CVX-08: `ctx.run*` Inside a query/mutation Is Prohibited in Principle 〔Official〕

A helper function is sufficient within the same transaction. The only exceptions are (a) when using a Convex component, or (b) when partial rollback on error is required.

### CVX-09: Separate Pure Functions from Side Effects; Do Not Use Classes 〔Zenn〕

Place computational logic (elapsed-time derivation, reschedule-candidate calculation, correlation coefficients, synthetic data generation) as side-effect-free pure functions in `convex/model/` or `src/shared/` so they are unit-testable. Keep state in the database, not in classes. Implement everything function-based.
Applies to this project: `elapsed(session, now)`, `suggestRescheduleSlots(blocks, nowHm)`, `pearson(xs, ys)`, and `nextDemoMetric(prev, rand)` are extracted as pure functions.

---

## B. Database Access

### CVX-10: Do Not Use `.filter` in DB Queries 〔Official〕

Replace it with `.withIndex` / `.withSearchIndex`, or filter in TypeScript code after fetching. This is enforced through manual review discipline: every `convex/` change must be checked against this file's checklist, and the `convex:convex-reviewer` subagent should be run on `convex/` code before merging. Exception: allowed only when combined with `.paginate` (even then, `withIndex` is still preferred).

### CVX-11: Only Use `.collect` When the Result Set Is Small (roughly under 1000) 〔Official〕

For queries whose result could be large or unbounded, use one of: narrowing with an index condition, `.take(n)`, `.paginate`, or a denormalized count. Keep in mind that every document fetched via `.collect` is billed for bandwidth and is subject to reactive re-execution.
Applies to this project: since every table has on the order of a few dozen rows per day, `withIndex` (narrowed by user/date) plus `.collect` is sufficient, but **`.collect` over the full table with no index condition is prohibited**. The correlation view (28 days) is narrowed with a range condition on `by_user_date` / `by_date`.

### CVX-12: Do Not Create Redundant Indexes 〔Official〕

When one index is a prefix of another, such as `by_foo` and `by_foo_and_bar`, consolidate them into one in principle (`by_foo_and_bar` can also be used to narrow by `foo` alone). The only exception is when a specific `_creationTime` sort order is required.
Applies to this project: keep the indexes in schema.ts to the minimal set defined in spec.md §3, and check for prefix duplication whenever adding a new one.

### CVX-13: Always Pass the Table Name as the First Argument to `ctx.db` Calls 〔Official (Convex 1.31+)〕

Standardize on the form `ctx.db.get("studySessions", id)` / `ctx.db.patch("studySessions", id, {...})`. This is enforced through manual review discipline: every `convex/` change must be checked against this file's checklist, and the `convex:convex-reviewer` subagent should be run on `convex/` code before merging.

### CVX-14: Do Not Use `Date.now()` Inside a query 〔Official〕

A query does not re-run just because time passes, and doing so pollutes the cache. Express time-dependence with one of the following:

1. **State-flag approach**: a scheduled function rewrites the document once the target time is reached, and the query reads the flag (this project's fasting phase and auto-abandon logic use this approach).
2. **Argument approach**: the client passes a rounded time value (in this project, `dateJst: "YYYY-MM-DD"`) as an argument.
   Applies to this project (required): `dashboard.live`, `blocks.todayWithSuggestions`, and `correlations.sleepVsStudy` **receive `dateJst` (and ranges) as arguments**. Elapsed time is derived client-side from the server-stored value (spec.md §6). `Date.now()` inside a mutation / action is fine.

### CVX-15: Complete Related Writes Within a Single mutation Transaction 〔Zenn / Official〕

Do not split a write that must stay consistent across multiple tables into multiple mutations. Doing it within a single handler guarantees all-or-nothing behavior.
Applies to this project: session complete (updating sessions + finalizing interruptions + setting blocks.status=done) is one mutation. Fasting start (insert + scheduling the job + saving the jobId) is also one mutation.

---

## C. Types & Schema

### CVX-16: Make schema.ts the Single Source of Truth 〔Zenn / Official TS Guide〕

Use `Doc<"table">` / `Id<"table">` from `_generated/dataModel` for types, and do not create manually duplicated type definitions. If a manual type conversion (`as`) becomes necessary, question the design. To avoid maintaining validators and types separately, export shared enum-like values as `v.union(v.literal(...))` and derive the type with `Infer<typeof xxx>`. Use `WithoutSystemFields<Doc<"...">>` for insertion types. Derive client-side types with `FunctionReturnType<typeof api.x.y>`.
Applies to this project: define and export `categoryValidator`, `dogEventKindValidator`, `presenceStateValidator`, etc. near the schema, and generate the frontend's selection UI from those `Infer` types as well.

### CVX-17: Await Every Promise 〔Official〕

A missing `await` on things like `ctx.scheduler.runAfter` / `ctx.db.patch` causes bugs such as "the job that should have been scheduled never runs" or "errors get silently swallowed". This is enforced through manual review discipline: every `convex/` change must be checked against this file's checklist, and the `convex:convex-reviewer` subagent should be run on `convex/` code before merging.

---

## D. Development Operations

### CVX-18: Enforce These Rules via Review Discipline, Not ESLint 〔Official, adapted for this project〕

This project uses oxlint via `vp check`, which cannot run the `@convex-dev` ESLint plugins (`no-filter-in-query`, `require-argument-validators`, `explicit-table-ids`, and, where available, `no-collect-in-query`) or the typescript-eslint `no-floating-promises` rule that the official guidance recommends installing at scaffold time. Since no static enforcement is available for these checks in this project, they are enforced manually instead: every `convex/` change must be reviewed against this file's checklist (see the bottom of this document), and the `convex:convex-reviewer` subagent must be invoked on `convex/` code before merging. The underlying rules themselves — no `.filter` in queries, explicit table-id arguments, required argument validators, awareness of unawaited promises — are unchanged; only the enforcement mechanism differs from the official recommendation.

### CVX-19: Write Schema-Aware Tests with convex-test 〔Zenn〕

Build the test environment with `convexTest(schema)`, and mock authentication with `t.withIdentity({ subject })`. Minimum required test targets: state-machine transition guards (rejecting a double start, ignoring `advancePhase` after `ended`), and pure functions in `model/`. UI tests are not required.

### CVX-20: Directory Conventions 〔Zenn (structure) + Official (model)〕

```
convex/
├── schema.ts                      // schema definition
├── actions/
│   ├── articles/
│   │   ├── publishArticle.ts      // external integration
│   │   └── ...                    // other actions
│   └── ...
├── api/
│   ├── articles/
│   │   ├── getUserArticles.ts     // API called from the frontend
│   │   └── ...                    // other APIs
│   └── ...
├── queries/
│   ├── articles/
│   │   ├── getArticle.ts          // Read (single)
│   │   ├── getArticles.ts         // Read (list)
│   │   └── searchArticles.ts      // Read (search)
│   └── ...
├── mutations/
│   ├── articles/
│   │   ├── createArticle.ts       // Create
│   │   ├── updateArticle.ts       // Update
│   │   └── deleteArticle.ts       // Delete
│   └── ...
├── services/
│   ├── articles/
│   │   ├── formatArticleForSEO.ts // pure function
│   │   └── ...                    // other service functions
│   └── ...
└── ...                            // other directories
```

This project does not adopt the queries/ mutations/ directory split shown in the Zenn article, since that level of separation is excessive for this project's scale. Instead, it uses two layers: one file per domain, plus the model layer (consistent with spec.md §2).

---

## Checklist (for PR Review)

- [ ] Does every public function have an args validator and call `requireUser`? (CVX-03/04)
- [ ] Do all scheduler / crons targets point to `internal.`? (CVX-05)
- [ ] No `.filter(`, no `.collect(` without an index condition, no `Date.now()` inside a query, and no `ctx.db.*` call missing a table name? (CVX-10/11/13/14)
- [ ] Is logic kept out of public functions (does it live in the model layer)? (CVX-02)
- [ ] No prefix-duplicate indexes? (CVX-12)
- [ ] No missing `await`s, and has this change been checked against this file's checklist plus a `convex:convex-reviewer` pass before merging? (CVX-17/18)
