import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useUpdateBlock() {
  return useConvexMutation(api.mutations.blocks.update.update);
}
