import { v } from "convex/values";

export const roleValidator = v.union(v.literal("self"), v.literal("partner"));
