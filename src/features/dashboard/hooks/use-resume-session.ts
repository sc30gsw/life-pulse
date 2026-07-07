import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";

import { api } from "~/../convex/_generated/api";

export function useResumeSession() {
  return useMutation({
    mutationFn: useConvexMutation(api.mutations.sessions.resume.resume),
  });
}
