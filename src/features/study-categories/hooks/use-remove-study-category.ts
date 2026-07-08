import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useRemoveStudyCategory() {
  return useConvexMutation(api.mutations.studyCategories.remove.remove);
}
