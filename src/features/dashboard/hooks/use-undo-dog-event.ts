import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useUndoDogEvent() {
  return useConvexMutation(api.mutations.dog.undoEvent.undoEvent);
}
