import { Result, type Result as ResultType } from "better-result";

import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { UserError } from "./errors";

export async function setAvatar(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
  storageId: Id<"_storage">,
): Promise<ResultType<void, UserError>> {
  const previousAvatarStorageId = user.avatarStorageId;

  await ctx.db.patch("appUsers", user._id, { avatarStorageId: storageId });

  // Delete the OLD storage object only after the patch succeeds, so a failed
  // patch never orphans the caller without ever losing the previous file.
  if (previousAvatarStorageId !== undefined && previousAvatarStorageId !== storageId) {
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
