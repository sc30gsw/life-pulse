import { useConvexMutation as useConvexMutationFn } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server";

export function useConvexMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
) {
  const mutationFn = useConvexMutationFn(mutation);

  return useMutation<FunctionReturnType<Mutation>, Error, FunctionArgs<Mutation>>({
    mutationFn: (args) => mutationFn(args),
  });
}
