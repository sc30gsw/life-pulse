import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useRenameStudyCategory() {
  return useConvexMutation(api.mutations.studyCategories.rename.rename);
}
