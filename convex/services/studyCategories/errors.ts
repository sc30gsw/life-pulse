import { TaggedError } from "better-result";

import type { Id } from "../../_generated/dataModel";

type StudyCategoryErrorCode =
  | "CATEGORY_EXISTS"
  | "CATEGORY_NOT_FOUND"
  | "INVALID_NAME"
  | "MOVE_TARGET_REQUIRED";

export class StudyCategoryError extends TaggedError("StudyCategoryError")<{
  categoryId?: Id<"studyCategories">;
  code: StudyCategoryErrorCode;
  message: string;
  targetCategoryId?: Id<"studyCategories">;
}>() {
  constructor(args: {
    categoryId?: Id<"studyCategories">;
    code: StudyCategoryErrorCode;
    message?: string;
    targetCategoryId?: Id<"studyCategories">;
  }) {
    super({ ...args, message: args.message ?? args.code });
  }
}
