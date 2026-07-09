import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useDeclareBlock() {
  return useConvexMutation(api.mutations.blocks.declare.declare);
}
