export type RequiredToolingPackages = [
  typeof import("@edge-runtime/vm"),
  // @ts-expect-error better-typescript-lib is resolved by TypeScript's libReplacement.
  typeof import("better-typescript-lib"),
  typeof import("happy-dom"),
];

export default {
  ignore: {
    files: ["convex/_generated/**"],
    overrides: [
      {
        files: ["convex/auth.config.ts", "convex/convex.config.ts"],
        rules: ["deslop/unused-export"],
      },
    ],
  },
};
