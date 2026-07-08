import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useStartSession() {
  return useConvexMutation(api.mutations.sessions.start.start);
}
