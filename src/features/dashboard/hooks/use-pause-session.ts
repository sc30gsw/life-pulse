import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function usePauseSession() {
  return useConvexMutation(api.mutations.sessions.pause.pause);
}
