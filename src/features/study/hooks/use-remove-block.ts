import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useRemoveBlock() {
  return useConvexMutation(api.mutations.blocks.remove.remove);
}
