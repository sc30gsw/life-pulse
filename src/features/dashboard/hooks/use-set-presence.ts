import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useSetPresence() {
  return useConvexMutation(api.mutations.partnerStatus.setStatus.setStatus);
}
