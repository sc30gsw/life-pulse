import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

export async function removeAvatar(ctx: MutationCtx, user: Doc<"appUsers">) {
  const previousAvatarStorageId = user.avatarStorageId;

  await ctx.db.patch("appUsers", user._id, { avatarStorageId: undefined });

  if (previousAvatarStorageId !== undefined) {
    await ctx.storage.delete(previousAvatarStorageId);
  }
}
