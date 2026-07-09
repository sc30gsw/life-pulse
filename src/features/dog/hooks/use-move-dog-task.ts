import { useConvexMutation as useConvexMutationFn } from "@convex-dev/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FunctionArgs, FunctionReturnType } from "convex/server";

import { api } from "~/../convex/_generated/api";
import type { Doc } from "~/../convex/_generated/dataModel";
import { dogTasksQuery } from "~/features/dog/api/dog-tasks-query";
import { optimisticReorderByTarget } from "~/lib/optimistic-reorder";

type MoveDogTaskMutation = typeof api.mutations.dogTasks.move.move;
type MoveDogTaskArgs = FunctionArgs<MoveDogTaskMutation>;
type DogTasks = Doc<"dogTasks">[];
type MoveDogTaskContext = Partial<Record<"previousTasks", DogTasks>>;

export function useMoveDogTask() {
  const queryClient = useQueryClient();
  const mutationFn = useConvexMutationFn(api.mutations.dogTasks.move.move);

  return useMutation<
    FunctionReturnType<MoveDogTaskMutation>,
    Error,
    MoveDogTaskArgs,
    MoveDogTaskContext
  >({
    mutationFn: (args) => mutationFn(args),
    onError: (_error, _args, context) => {
      if (context?.previousTasks !== undefined) {
        queryClient.setQueryData(dogTasksQuery().queryKey, context.previousTasks);
      }
    },
    onMutate: async (args) => {
      const { targetTaskId } = args;

      if (targetTaskId === undefined) {
        return {};
      }

      const query = dogTasksQuery();
      await queryClient.cancelQueries({ queryKey: query.queryKey });
      const previousTasks = queryClient.getQueryData<DogTasks>(query.queryKey);

      queryClient.setQueryData<DogTasks>(query.queryKey, (current) =>
        current === undefined
          ? current
          : optimisticReorderByTarget(current, args.taskId, targetTaskId),
      );

      return { previousTasks };
    },
  });
}
