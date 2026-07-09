import { ConvexError } from "convex/values";

import type { MutationCtx } from "../../_generated/server";
import { get as getDog } from "./get";

export async function removeImage(ctx: MutationCtx) {
  const dog = await getDog(ctx);

  if (dog === null) {
    throw new ConvexError("DOG_NOT_FOUND");
  }

  const previousImageStorageId = dog.imageStorageId;

  await ctx.db.patch("dogs", dog._id, { imageStorageId: undefined });

  if (previousImageStorageId !== undefined) {
    await ctx.storage.delete(previousImageStorageId);
  }
}
