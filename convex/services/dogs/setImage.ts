import { Result, type Result as ResultType } from "better-result";

import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { DogError } from "./errors";
import { get as getDog } from "./get";

export async function setImage(
  ctx: MutationCtx,
  storageId: Id<"_storage">,
): Promise<ResultType<void, DogError>> {
  const dog = await getDog(ctx);

  if (dog === null) {
    return Result.err(new DogError({ code: "DOG_NOT_FOUND", storageId }));
  }

  const previousImageStorageId = dog.imageStorageId;

  await ctx.db.patch("dogs", dog._id, { imageStorageId: storageId });

  if (previousImageStorageId !== undefined && previousImageStorageId !== storageId) {
    const deleteResult = await Result.tryPromise({
      catch: (cause) =>
        new DogError({
          cause,
          code: "STORAGE_DELETE_FAILED",
          storageId: previousImageStorageId,
        }),
      try: () => ctx.storage.delete(previousImageStorageId),
    });

    if (Result.isError(deleteResult)) {
      return deleteResult;
    }
  }

  return Result.ok();
}
