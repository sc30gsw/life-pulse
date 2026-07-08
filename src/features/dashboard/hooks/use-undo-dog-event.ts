import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useUndoDogEvent() {
  return useConvexMutation(api.mutations.dog.undoEvent.undoEvent);
}
