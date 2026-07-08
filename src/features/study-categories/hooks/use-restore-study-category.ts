import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useRestoreStudyCategory() {
  return useConvexMutation(api.mutations.studyCategories.restore.restore);
}
