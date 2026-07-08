import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useUpdateBlock() {
  return useConvexMutation(api.mutations.blocks.update.update);
}
