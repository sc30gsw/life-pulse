import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useRemoveBlock() {
  return useConvexMutation(api.mutations.blocks.remove.remove);
}
