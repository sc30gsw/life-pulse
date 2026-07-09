"use node";

import { v } from "convex/values";

import { action } from "../../_generated/server";
import { unwrapConvexResult } from "../../lib/result";
import { updateEmail as updateEmailService } from "../../services/users/updateEmail";

// DEVIATION FROM THE ORIGINAL PLAN (documented, not a silent change): this is
// a public `action`, not a `mutation`, because @convex-dev/auth's
// retrieveAccount (used to verify currentPassword — see
// services/users/updateEmail.ts) is typed `GenericActionCtx`: internally it
// dispatches to the auth library's own internal store mutation, a method
// that only exists on an action ctx. A mutation ctx has no such dispatch at
// all (CVX-08), so there is no way to call this library primitive from a
// mutation. Filed under convex/actions/users/ per CVX-20's directory
// convention for actions, not convex/mutations/users/.
export const updateEmail = action({
  args: { currentPassword: v.string(), newEmail: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    unwrapConvexResult(await updateEmailService(ctx, args));

    return null;
  },
});
