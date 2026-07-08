import { ConvexError } from "convex/values";

import type { MutationCtx, QueryCtx } from "../../_generated/server";

export async function get(ctx: QueryCtx | MutationCtx) {
  const dog = await ctx.db.query("dogs").unique();

  if (dog === null) {
    // The FR-10 seed migration guarantees exactly one `dogs` document exists;
    // if it's somehow missing, surface that loudly instead of inventing a
    // fallback name.
    throw new ConvexError("DOG_NOT_FOUND");
  }

  return dog;
}
