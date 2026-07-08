import { v } from "convex/values";

import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { dogDocumentValidator } from "../../lib/validators";
import { get as getDog } from "../../services/dogs/get";

export const get = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({ ...dogDocumentValidator.fields, imageUrl: v.union(v.null(), v.string()) }),
  ),
  handler: async (ctx) => {
    await requireUser(ctx);
    const dog = await getDog(ctx);

    if (dog === null) {
      return null;
    }

    const imageUrl =
      dog.imageStorageId === undefined ? null : await ctx.storage.getUrl(dog.imageStorageId);

    return { ...dog, imageUrl };
  },
});
