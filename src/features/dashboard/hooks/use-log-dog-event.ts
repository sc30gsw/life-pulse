import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useLogDogEvent() {
  return useConvexMutation(api.mutations.dog.logEvent.logEvent);
}
