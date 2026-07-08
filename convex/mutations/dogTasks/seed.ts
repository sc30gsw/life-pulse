import { v } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import { internalMutation } from "../../_generated/server";

const SEED_TASKS = [
  { name: "朝散歩", sortOrder: 0 },
  { name: "朝ごはん", sortOrder: 1 },
  { name: "昼ごはん", sortOrder: 2 },
  { name: "薬", sortOrder: 3 },
  { name: "夕散歩", sortOrder: 4 },
  { name: "夜ごはん", sortOrder: 5 },
  { name: "歯磨き", sortOrder: 6 },
] as const satisfies Pick<Doc<"dogTasks">, "name" | "sortOrder">[];

// One-off FR-10 migration seed: creates the initial `dogTasks` rows mirroring
// the previous hardcoded DOG_CARE_KINDS board order. Dog profile data is
// created from the `/dog` UI, not from seed data. Invoked once via the CLI
// (`npx convex run mutations/dogTasks/seed:seed`) — never call this from
// client code or reference it via `api`.
export const seed = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existingTask = await ctx.db.query("dogTasks").first();

    if (existingTask !== null) {
      // Idempotency guard: safe to invoke twice.
      return null;
    }

    await Promise.all(
      SEED_TASKS.map((task) =>
        ctx.db.insert("dogTasks", {
          archivedAt: undefined,
          name: task.name,
          sortOrder: task.sortOrder,
        }),
      ),
    );

    return null;
  },
});
