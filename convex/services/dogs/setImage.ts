import { ConvexError } from "convex/values";

import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { get as getDog } from "./get";

export async function setImage(ctx: MutationCtx, storageId: Id<"_storage">) {
  const dog = await getDog(ctx);

  if (dog === null) {
    throw new ConvexError("DOG_NOT_FOUND");
  }

  const previousImageStorageId = dog.imageStorageId;

  await ctx.db.patch("dogs", dog._id, { imageStorageId: storageId });

  if (previousImageStorageId !== undefined && previousImageStorageId !== storageId) {
    await ctx.storage.delete(previousImageStorageId);
  }
}
