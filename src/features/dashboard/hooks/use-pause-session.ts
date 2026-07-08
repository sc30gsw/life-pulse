import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function usePauseSession() {
  return useConvexMutation(api.mutations.sessions.pause.pause);
}
