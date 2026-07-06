import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("viewer returns null when unauthenticated", async () => {
  const t = convexTest(schema, testModules);
  const viewer = await t.query(api.queries.users.viewer.viewer, {});
  expect(viewer).toBeNull();
});
