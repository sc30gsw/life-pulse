import { useConvexMutation } from "~/lib/use-convex-mutation";

import { api } from "~/../convex/_generated/api";

export function useResumeSession() {
  return useConvexMutation(api.mutations.sessions.resume.resume);
}
