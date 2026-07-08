import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useRequestGarminSync() {
  return useConvexMutation(api.mutations.health.requestGarminSync.requestGarminSync);
}
