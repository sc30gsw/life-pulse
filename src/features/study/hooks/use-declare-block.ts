import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useDeclareBlock() {
  return useConvexMutation(api.mutations.blocks.declare.declare);
}
