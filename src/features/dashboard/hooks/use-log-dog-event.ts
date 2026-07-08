import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useLogDogEvent() {
  return useConvexMutation(api.mutations.dog.logEvent.logEvent);
}
