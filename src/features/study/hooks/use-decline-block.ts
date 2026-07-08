import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useDeclineBlock() {
  return useConvexMutation(api.mutations.blocks.decline.decline);
}
