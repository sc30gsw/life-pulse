import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { get as getDog } from "./get";

type UpdateArgs = Pick<Doc<"dogs">, "name">;

export async function update(ctx: MutationCtx, args: UpdateArgs) {
  const name = args.name.trim();

  if (name.length === 0) {
    throw new ConvexError("INVALID_NAME");
  }

  const dog = await getDog(ctx);

  if (dog === null) {
    throw new ConvexError("DOG_NOT_FOUND");
  }

  await ctx.db.patch("dogs", dog._id, { name });
}
