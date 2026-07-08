import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { query } from "../../_generated/server";
import { appUserDocumentValidator } from "../../lib/validators";
import { viewer as viewerService } from "../../services/users/viewer";

export const viewer = query({
  args: {},
  returns: v.union(v.null(), appUserDocumentValidator),
  handler: async (ctx) => {
    const authSubject = await getAuthUserId(ctx);

    if (authSubject === null) {
      return null;
    }

    return await viewerService(ctx, authSubject);
  },
});
