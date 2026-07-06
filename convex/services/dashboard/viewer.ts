import type { Doc } from "../../_generated/dataModel";

export function viewer(user: Doc<"appUsers">) {
  return { displayName: user.displayName, role: user.role };
}
