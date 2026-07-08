import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useErodeBlock() {
  return useConvexMutation(api.mutations.blocks.erode.erode);
}
