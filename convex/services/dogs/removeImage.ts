import { Result, type Result as ResultType } from "better-result";

import type { MutationCtx } from "../../_generated/server";
import { DogError } from "./errors";
import { get as getDog } from "./get";

export async function removeImage(ctx: MutationCtx): Promise<ResultType<void, DogError>> {
  const dog = await getDog(ctx);

  if (dog === null) {
    return Result.err(new DogError({ code: "DOG_NOT_FOUND" }));
  }

  const previousImageStorageId = dog.imageStorageId;

  await ctx.db.patch("dogs", dog._id, { imageStorageId: undefined });

  if (previousImageStorageId !== undefined) {
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
