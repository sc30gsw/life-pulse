import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useErodeBlock() {
  return useConvexMutation(api.mutations.blocks.erode.erode);
}
