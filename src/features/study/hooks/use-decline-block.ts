import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useDeclineBlock() {
  return useConvexMutation(api.mutations.blocks.decline.decline);
}
