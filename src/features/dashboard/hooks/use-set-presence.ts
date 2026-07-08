import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useSetPresence() {
  return useConvexMutation(api.mutations.partnerStatus.setStatus.setStatus);
}
