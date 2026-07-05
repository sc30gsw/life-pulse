---
description: convex-test is the primary testing approach — convexTest(schema), auth mocking, minimum CVX-19 coverage; Testing Library query priority reserved for future UI tests
globs: ["**/*.{test,spec}.{ts,tsx}"]
alwaysApply: true
---

# Testing

Full guidance is in [CODING_GUIDELINES.md](../CODING_GUIDELINES.md) §Coding with Testing in Mind.

## Philosophy

Write tests from the user's perspective. Assert on what the user sees and can interact with, not implementation details.

## Vitest setup

Import test utilities from `vite-plus/test`, not from `vitest` directly:

```typescript
// CORRECT
import { expect, test, vi } from "vite-plus/test";

// WRONG: direct vitest import
import { expect, test } from "vitest";
```

Run tests with `vp test`, not `vp run vitest`.

## convex-test (primary testing approach)

This project's test suite is built on `convex-test`, per [convex-rules.md](../convex-rules.md) CVX-19. Convex functions are tested directly against a real, schema-backed in-memory instance — there is no MSW here, since data comes from reactive Convex queries rather than a mockable REST layer.

### Setup: `convexTest(schema)`

Build the test environment from the project's `schema.ts` so every test runs against the real table/index shape:

```typescript
// convex/sessions.test.ts — same directory as schema.ts and _generated/
import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";
import { api } from "./_generated/api";
import schema from "./schema";

test("start creates a session", async () => {
  const t = convexTest(schema);

  await t.mutation(api.sessions.start, {
    category: "focus",
    dateJst: "2026-07-06",
  });
});
```

### Mocking auth: `t.withIdentity({ subject })`

Every public function requires an authenticated caller (CVX-04). Use `t.withIdentity(...)` to act as a given user instead of stubbing `ctx.auth`:

```typescript
test("rejects a second concurrent session for the same user", async () => {
  const t = convexTest(schema);
  const asUser = t.withIdentity({ subject: "user_123" });

  await asUser.mutation(api.sessions.start, { category: "focus", dateJst: "2026-07-06" });

  await expect(
    asUser.mutation(api.sessions.start, { category: "focus", dateJst: "2026-07-06" }),
  ).rejects.toThrow();
});
```

### Minimum required test targets (CVX-19)

At minimum, cover:

- **State machine transition guards**
  - Double-start rejection on `sessions` — starting a session while one is already active must be rejected.
  - Double-start rejection on `fasting` — same guard for the fasting state machine.
  - `advancePhase` ignored after `ended` — calling it again once a fasting session has ended must be a no-op, not a state change.
- **Pure functions in `convex/model/`** — no `convexTest` harness needed; call these directly with plain inputs/outputs:
  - `elapsed(session, now)` — elapsed-time derivation.
  - `suggestRescheduleSlots(blocks, nowHm)` — reschedule-slot suggestion.
  - `pearson(xs, ys)` — Pearson correlation coefficient.
  - `nextDemoMetric(prev, rand)` — demo random-walk generator.

```typescript
// convex/model/sessions.test.ts — sibling to convex/model/sessions.ts
import { expect, test } from "vite-plus/test";
import { elapsed } from "./sessions";

test("elapsed derives minutes from session start to now", () => {
  expect(elapsed({ startedAt: 0 }, 60_000)).toBe(1);
});
```

## Future: UI component testing (not yet in use)

No Testing Library package is installed, and none of this project's current test suite renders components — today's coverage is entirely `convex-test` against `convex/`. If/when UI component tests are introduced later, use this query priority:

1. **`getByRole`** — most accessible, matches semantic HTML
2. **`getByText`** — for visible text content
3. **`getByLabelText`** / **`getByPlaceholderText`** — for form fields
4. **`getByAltText`** — for images

```typescript
// CORRECT: role-based query
const button = screen.getByRole("button", { name: "送信" });
expect(screen.getByRole("heading", { name: "ユーザー一覧" })).toBeInTheDocument();

// WRONG: testId or DOM selectors
const button = screen.getByTestId("submit-button");
const heading = document.querySelector(".heading-text");
```

**`data-testid` is forbidden.** If an element has no accessible role or text, add an `aria-label` instead.

## Related skills

- `webapp-testing` — testing patterns and helpers for this project
</content>
