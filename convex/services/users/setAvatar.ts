import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

export async function setAvatar(
  ctx: MutationCtx,
  user: Doc<"appUsers">,
  storageId: Id<"_storage">,
) {
  const previousAvatarStorageId = user.avatarStorageId;

  await ctx.db.patch("appUsers", user._id, { avatarStorageId: storageId });

  // Delete the OLD storage object only after the patch succeeds, so a failed
  // patch never orphans the caller without ever losing the previous file.
  if (previousAvatarStorageId !== undefined && previousAvatarStorageId !== storageId) {
    await ctx.storage.delete(previousAvatarStorageId);
  }
}
