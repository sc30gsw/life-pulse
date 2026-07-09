import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useCompleteSession() {
  return useConvexMutation(api.mutations.sessions.complete.complete);
}
