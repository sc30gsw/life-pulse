import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useCompleteSession() {
  return useConvexMutation(api.mutations.sessions.complete.complete);
}
