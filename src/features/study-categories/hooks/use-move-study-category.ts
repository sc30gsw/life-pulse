import { useConvexMutation as useConvexMutationFn } from "@convex-dev/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FunctionArgs, FunctionReturnType } from "convex/server";

import { api } from "~/../convex/_generated/api";
import type { Doc } from "~/../convex/_generated/dataModel";
import { studyCategoriesQuery } from "~/features/study-categories/api/study-categories-query";
import { optimisticReorderByTarget } from "~/lib/optimistic-reorder";

type MoveStudyCategoryMutation = typeof api.mutations.studyCategories.move.move;
type MoveStudyCategoryArgs = FunctionArgs<MoveStudyCategoryMutation>;
type StudyCategories = Doc<"studyCategories">[];
type MoveStudyCategoryContext = Partial<Record<"previousCategories", StudyCategories>>;

export function useMoveStudyCategory() {
  const queryClient = useQueryClient();
  const mutationFn = useConvexMutationFn(api.mutations.studyCategories.move.move);

  return useMutation<
    FunctionReturnType<MoveStudyCategoryMutation>,
    Error,
    MoveStudyCategoryArgs,
    MoveStudyCategoryContext
  >({
    mutationFn: (args) => mutationFn(args),
    onError: (_error, _args, context) => {
      if (context?.previousCategories !== undefined) {
        queryClient.setQueryData(studyCategoriesQuery().queryKey, context.previousCategories);
      }
    },
    onMutate: async (args) => {
      const { targetCategoryId } = args;

      if (targetCategoryId === undefined) {
        return {};
      }

      const query = studyCategoriesQuery();
      await queryClient.cancelQueries({ queryKey: query.queryKey });
      const previousCategories = queryClient.getQueryData<StudyCategories>(query.queryKey);

      queryClient.setQueryData<StudyCategories>(query.queryKey, (current) =>
        current === undefined
          ? current
          : optimisticReorderByTarget(current, args.categoryId, targetCategoryId, {
              canMove: (category) => category.archivedAt === undefined,
            }),
      );

      return { previousCategories };
    },
  });
}
