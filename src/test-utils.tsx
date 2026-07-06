import { MantineProvider } from "@mantine/core";
import { cleanup, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach } from "vite-plus/test";

import { theme } from "~/lib/theme";

//* vitest globals are disabled in this project, so @testing-library/react's
//* automatic afterEach(cleanup) never registers. Do it once here so every
//* test file that imports renderWithMantine gets DOM cleanup between tests.
afterEach(cleanup);

export function renderWithMantine(ui: ReactElement) {
  return render(<MantineProvider theme={theme}>{ui}</MantineProvider>);
}
