import { query } from "../../_generated/server";
import { requireUser } from "../../lib/auth";
import { dogDocumentValidator } from "../../lib/validators";
import { get as getDog } from "../../services/dogs/get";

export const get = query({
  args: {},
  returns: dogDocumentValidator,
  handler: async (ctx) => {
    await requireUser(ctx);

    return await getDog(ctx);
  },
});
