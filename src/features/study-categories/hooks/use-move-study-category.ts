import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useMoveStudyCategory() {
  return useConvexMutation(api.mutations.studyCategories.move.move);
}
