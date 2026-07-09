import { useSuspenseQuery } from "@tanstack/react-query";

import { dogQuery } from "~/features/dog/api/dog-query";

export function useDog() {
  return useSuspenseQuery(dogQuery());
}
