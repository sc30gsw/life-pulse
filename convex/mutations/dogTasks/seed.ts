import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";

const SEED_TASKS = [
  { name: "朝散歩", sortOrder: 0 },
  { name: "朝ごはん", sortOrder: 1 },
  { name: "昼ごはん", sortOrder: 2 },
  { name: "薬", sortOrder: 3 },
  { name: "夕散歩", sortOrder: 4 },
  { name: "夜ごはん", sortOrder: 5 },
  { name: "歯磨き", sortOrder: 6 },
] as const;

// One-off FR-10 migration seed: creates the singleton `dogs` document plus
// the initial `dogTasks` rows mirroring the previous hardcoded
// DOG_CARE_KINDS board order. Invoked once via the CLI
// (`npx convex run mutations/dogTasks/seed:seed`) — never call this from
// client code or reference it via `api`.
export const seed = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existingDog = await ctx.db.query("dogs").first();

    if (existingDog !== null) {
      // Idempotency guard: safe to invoke twice.
      return null;
    }

    await ctx.db.insert("dogs", { name: "ハマロ" });

    for (const task of SEED_TASKS) {
      await ctx.db.insert("dogTasks", {
        archivedAt: undefined,
        name: task.name,
        sortOrder: task.sortOrder,
      });
    }

    return null;
  },
});
