import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { DogError } from "./errors";
import { get as getDog } from "./get";

type UpdateArgs = Pick<Doc<"dogs">, "name">;

export async function update(ctx: MutationCtx, args: UpdateArgs): Promise<ResultType<void, DogError>> {
  const name = args.name.trim();

  if (name.length === 0) {
    return Result.err(new DogError({ code: "INVALID_NAME" }));
  }

  const dog = await getDog(ctx);

  if (dog === null) {
    await ctx.db.insert("dogs", { name });
    return Result.ok();
  }

  await ctx.db.patch("dogs", dog._id, { name });

  return Result.ok();
}
