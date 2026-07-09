type Reorderable<Id extends string> = {
  _id: Id;
  sortOrder: number;
};

type OptimisticReorderOptions<T> = {
  canMove?: (item: T) => boolean;
};

export function optimisticReorderByTarget<T extends Reorderable<string>>(
  items: readonly T[],
  itemId: T["_id"],
  targetId: T["_id"],
  options: OptimisticReorderOptions<T> = {},
): T[] {
  const canMove = options.canMove ?? (() => true);
  const movableItems = items.filter(canMove).sort((a, b) => a.sortOrder - b.sortOrder);
  const fromIndex = movableItems.findIndex((item) => item._id === itemId);
  const toIndex = movableItems.findIndex((item) => item._id === targetId);

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return items;
  }

  const reorderedItems = [...movableItems];
  const [movedItem] = reorderedItems.splice(fromIndex, 1);

  if (movedItem === undefined) {
    return items;
  }

  const targetIndexAfterRemoval = reorderedItems.findIndex((item) => item._id === targetId);

  if (targetIndexAfterRemoval === -1) {
    return items;
  }

  const insertIndex = fromIndex < toIndex ? targetIndexAfterRemoval + 1 : targetIndexAfterRemoval;
  reorderedItems.splice(insertIndex, 0, movedItem);

  const reorderedItemsWithSortOrder = reorderedItems.map((item, sortOrder) => ({
    ...item,
    sortOrder,
  }));
  let nextMovableIndex = 0;

  return items.map((item) => {
    if (!canMove(item)) {
      return item;
    }

    const next = reorderedItemsWithSortOrder[nextMovableIndex];
    nextMovableIndex += 1;

    return next ?? item;
  });
}
