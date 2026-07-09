import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useResumeSession() {
  return useConvexMutation(api.mutations.sessions.resume.resume);
}
