import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { UserError } from "./errors";

export async function removeAvatar(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
): Promise<ResultType<void, UserError>> {
  const previousAvatarStorageId = user.avatarStorageId;

  await ctx.db.patch("appUsers", user._id, { avatarStorageId: undefined });

  if (previousAvatarStorageId !== undefined) {
    const deleteResult = await Result.tryPromise({
      catch: (cause) =>
        new UserError({
          cause,
          code: "STORAGE_DELETE_FAILED",
          storageId: previousAvatarStorageId,
        }),
      try: () => ctx.storage.delete(previousAvatarStorageId),
    });

    if (Result.isError(deleteResult)) {
      return deleteResult;
    }
  }

  return Result.ok();
}
