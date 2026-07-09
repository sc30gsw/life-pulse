import { api } from "~/../convex/_generated/api";
import { useConvexMutation } from "~/lib/use-convex-mutation";

export function useArchiveStudyCategory() {
  return useConvexMutation(api.mutations.studyCategories.archive.archive);
}
