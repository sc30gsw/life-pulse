import { useSuspenseQuery } from "@tanstack/react-query";

import type { Doc, Id } from "~/../convex/_generated/dataModel";
import { studyCategoriesQuery } from "~/features/study-categories/api/study-categories-query";

export function useStudyCategoriesQuery() {
  const categories = useSuspenseQuery(studyCategoriesQuery()).data;
  const activeCategories = categories.filter((category) => category.archivedAt === undefined);
  const categoriesById = new Map(categories.map((category) => [category._id, category]));

  function categoryName(categoryId: Id<"studyCategories"> | undefined) {
    if (categoryId === undefined) {
      return "カテゴリ未設定";
    }

    return categoriesById.get(categoryId)?.name ?? "カテゴリ未設定";
  }

  function categoryOptions(currentCategoryId?: Doc<"studyCategories">["_id"]) {
    if (currentCategoryId === undefined) {
      return activeCategories;
    }

    const current = categoriesById.get(currentCategoryId);

    if (current === undefined || current.archivedAt === undefined) {
      return activeCategories;
    }

    return [...activeCategories, current].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  return { activeCategories, categories, categoriesById, categoryName, categoryOptions } as const;
}
