import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

// Deliberately mirrors the dashboard feature's hook of the same name:
// cross-feature imports are forbidden, and the api reference itself is the
// single source of truth, so this 5-line duplication cannot drift.
export function useStartSession() {
  return useConvexMutation(api.mutations.sessions.start.start);
}
