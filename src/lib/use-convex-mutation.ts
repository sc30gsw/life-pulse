import { useConvexMutation as useConvexMutationFn } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import type { FunctionReference } from "convex/server";

export function useConvexMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
) {
  return useMutation({ mutationFn: useConvexMutationFn(mutation) });
}
