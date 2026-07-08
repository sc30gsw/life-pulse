import * as v from "valibot";

import { DOG_TASK_COPY } from "~/features/dog/constants/dog-profile";

export const DogTaskNameSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(1, DOG_TASK_COPY.validation.nameRequired)),
});

export type DogTaskNameInput = v.InferOutput<typeof DogTaskNameSchema>;
export type DogTaskNameFormInput = v.InferInput<typeof DogTaskNameSchema>;
