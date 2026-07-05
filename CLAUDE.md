@AGENTS.md

## Current Implementation Status

Update this section as implementation progresses.

* The repository is still in its post-scaffold state. src/features/, convex/, src/lib/, and src/components/ have not been created yet. The layout shown in .claude/rules/ represents the target structure — follow it when creating new files. Do not import anything based on the assumption that those directories already exist.
* Actual stack: TanStack Start + Convex (backend not implemented yet) + Valibot + better-result + Tailwind v4 + oxfmt/oxlint — all accessed via vp.
* @mantine/core and @tanstack/react-form are not installed yet. Only tailwind-preset-mantine and @tanstack/valibot-adapter have been added. Apply Mantine / TanStack Form-related rules only after those packages are introduced.
* The canonical technical specification is docs/spec.md; the product requirements are in docs/requirements.md.
