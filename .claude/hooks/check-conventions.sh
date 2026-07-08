#!/bin/bash
# PostToolUse hook (Write|Edit): checks .claude/rules conventions
# On violation: exit 2 + stderr feedback to Claude
f=$(jq -r '.tool_input.file_path // .tool_response.filePath // empty')
[ -z "$f" ] && exit 0

case "$f" in
  *.ts | *.tsx) ;;
  *) exit 0 ;;
esac
case "$f" in
  *routeTree.gen.ts | */lib/api/generated/* | */vite-env.d.ts) exit 0 ;;
esac
[ -f "$f" ] || exit 0

errs=""
grep -qn 'console\.log' "$f" &&
  errs="${errs}- console.log is forbidden (common/coding-style.md)\n"
grep -qnE '^[[:space:]]*(export[[:space:]]+)?(declare[[:space:]]+)?interface[[:space:]]+[A-Za-z]' "$f" &&
  errs="${errs}- interface is forbidden — use type (common/coding-style.md)\n"
case "$f" in
  */convex/*) ;; # convex/tsconfig.json has no `~` path alias — relative imports are correct here
  *)
    grep -qnE "from[[:space:]]+['\"]\\.\\.?/" "$f" &&
      errs="${errs}- relative imports are forbidden — use the ~/ alias (typescript/project-structure.md)\n"
    ;;
esac

case "$f" in
  */src/routes/* | *.config.ts | */src/router.tsx | */convex/schema.ts | */convex/auth.config.ts | */convex/http.ts | */convex/crons.ts) ;;
  *)
    grep -qnE '^[[:space:]]*export[[:space:]]+default' "$f" &&
      errs="${errs}- export default is forbidden — use named exports (typescript/react-conventions.md)\n"
    ;;
esac

if [ -n "$errs" ]; then
  printf 'Convention violations in %s:\n%b' "$f" "$errs" >&2
  exit 2
fi
exit 0
