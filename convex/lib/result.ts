import { Result, type Result as ResultType } from "better-result";
import { ConvexError } from "convex/values";

export type ConvexErrorLike = {
  code: string;
};

export function unwrapConvexResult<T, E extends ConvexErrorLike>(result: ResultType<T, E>): T {
  if (Result.isError(result)) {
    throw new ConvexError(result.error.code);
  }

  return result.value;
}
