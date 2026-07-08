import * as v from "valibot";

import { DOG_PROFILE_COPY } from "~/features/dog/constants/dog-profile";

export const DogNameSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(1, DOG_PROFILE_COPY.validation.nameRequired)),
});

export type DogNameInput = v.InferOutput<typeof DogNameSchema>;
export type DogNameFormInput = v.InferInput<typeof DogNameSchema>;
