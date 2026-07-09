import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useStartSession() {
  return useConvexMutation(api.mutations.sessions.start.start);
}
