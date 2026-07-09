import { expect, test } from "vite-plus/test";

import { optimisticReorderByTarget } from "~/lib/optimistic-reorder";

test("moves an item after the target when dragging downward", () => {
  const items = [
    { _id: "a", sortOrder: 0 },
    { _id: "b", sortOrder: 1 },
    { _id: "c", sortOrder: 2 },
  ];

  expect(optimisticReorderByTarget(items, "a", "c")).toEqual([
    { _id: "b", sortOrder: 0 },
    { _id: "c", sortOrder: 1 },
    { _id: "a", sortOrder: 2 },
  ]);
});

test("moves an item before the target when dragging upward", () => {
  const items = [
    { _id: "a", sortOrder: 0 },
    { _id: "b", sortOrder: 1 },
    { _id: "c", sortOrder: 2 },
  ];

  expect(optimisticReorderByTarget(items, "c", "a")).toEqual([
    { _id: "c", sortOrder: 0 },
    { _id: "a", sortOrder: 1 },
    { _id: "b", sortOrder: 2 },
  ]);
});

test("leaves non-movable items in place", () => {
  const items = [
    { _id: "a", archived: false, sortOrder: 0 },
    { _id: "b", archived: true, sortOrder: 1 },
    { _id: "c", archived: false, sortOrder: 2 },
  ];

  expect(
    optimisticReorderByTarget(items, "a", "c", {
      canMove: (item) => !item.archived,
    }),
  ).toEqual([
    { _id: "c", archived: false, sortOrder: 0 },
    { _id: "b", archived: true, sortOrder: 1 },
    { _id: "a", archived: false, sortOrder: 1 },
  ]);
});
