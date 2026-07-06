# React Doctor false positives

- `deslop/unused-dev-dependency` - `better-typescript-lib` in package.json - not imported by source but consumed by TypeScript's `libReplacement: true` (tsconfig.json) compiler option, which resolves lib `.d.ts` overrides from this package by convention, not via an import statement. `.fallowrc.json` already lists it under `ignoreDependencies` for the same reason. Skip after verifying `tsconfig.json` still has `"libReplacement": true`.
