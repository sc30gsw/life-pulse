import { v } from "convex/values";

import { query } from "../../_generated/server";
import { getCurrentAuthParts, isSecondFactorVerified } from "../../lib/auth";

export const secondFactorStatus = query({
  args: {},
  returns: v.object({ required: v.boolean(), verified: v.boolean() }),
  handler: async (ctx) => {
    const auth = await getCurrentAuthParts(ctx);

    if (auth === null || auth.sessionId === null) {
      return { required: false, verified: auth !== null };
    }

    return {
      required: true,
      verified: await isSecondFactorVerified(ctx, auth.authUserId, auth.sessionId),
    };
  },
});
