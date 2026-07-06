# Using Vite+ (`vp`)

**Vite+** is one CLI for dev, build, tests, lint, format, and package management—it wraps Vite and related bundled tooling. `vp dev` and `vp build` invoke Vite. Explore with `vp help`, `vp <command> --help`, and `vp --version`.

**Common commands:** `vp install`, `vp dev`, `vp check`, `vp lint`, `vp test`, `vp build`, `vp run <script>`, `vp add` / `vp remove` / `vp update`.

**Workflow:** After pulling, run `vp install` when dependencies or lockfiles may have changed. Before calling work done, run `vp check` and `vp test`.

## Common Pitfalls

- **Using the package manager directly:** Do not use pnpm, npm, or Yarn directly. Vite+ can handle all package manager operations.
- **Always use Vite commands to run tools:** Don't attempt to run `vp vitest` or `vp oxlint`. They do not exist. Use `vp test` and `vp lint` instead.
- **Running scripts:** Vite+ commands take precedence over `package.json` scripts. If there is a `test` script defined in `scripts` that conflicts with the built-in `vp test` command, run it using `vp run test`.
- **Do not install Vitest, Oxlint, Oxfmt, or tsdown directly:** Vite+ wraps these tools. They must not be installed directly. You cannot upgrade these tools by installing their latest versions. Always use Vite+ commands.
- **Use Vite+ wrappers for one-off binaries:** Use `vp dlx` instead of package-manager-specific `dlx`/`npx` commands.
- **Import JavaScript modules from `vite-plus`:** Instead of importing from `vite` or `vitest`, all modules should be imported from the project's `vite-plus` dependency. For example, `import { defineConfig } from 'vite-plus';` or `import { expect, test, vi } from 'vite-plus/test';`. You must not install `vitest` to import test utilities.
- **Type-Aware Linting:** There is no need to install `oxlint-tsgolint`, `vp lint --type-aware` works out of the box.

## Supplementary project tools

Not part of `vp check`. Use `vp run` so installs stay routed through Vite+.

- **Fallow** (`vp run fallow`) — unused files, dependencies, and exports. Use when trimming deps or refactoring entry points (`.fallowrc.json` configures the project).
- **react-doctor** (`vp run doctor`) — React-focused health checks. The script uses `--no-lint`; keep ordinary linting on `vp lint`.

## Behavioral Guidelines

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## Agent skills

### Issue tracker

Issues tracked as GitHub Issues via `gh` CLI; external PRs are not treated as a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`) used as-is. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — `CONTEXT.md` + `docs/adr/` at repo root (not yet created). See `docs/agents/domain.md`.

## Design

The UI design source of truth is the claude_design project `9bc66e31-1c1d-4e0b-8082-c955660c6963`, file `Live Board.dc.html`, summarized with an implementation mapping in `docs/design/live-board.md`. All screens — including auth pages (`/login`, `/signup`) — must follow that design language (dark theme, JetBrains Mono, card UI, CSS-var tokens mapped into `src/lib/theme.ts`). Enforcement rule: `.claude/rules/web/design-live-board.md`.
