import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import { roleValidator } from "./lib/validators";

export default defineSchema({
  ...authTables,

  appUsers: defineTable({
    authSubject: v.string(),
    displayName: v.string(),
    role: roleValidator,
  }).index("by_subject", ["authSubject"]),
});
