/// <reference types="vite-plus/client" />
import { MantineProvider } from "@mantine/core";
import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";
import { HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

import { theme } from "~/lib/theme";
import { ErrorComponent } from "~/routes/-components/error";
import { NotFoundComponent } from "~/routes/-components/not-found";
import { PendingComponent } from "~/routes/-components/pending";

import appCss from "~/styles.css?url";

const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(async () => {
      const { TanStackRouterDevtools } = await import("~/router-devtools");
      return { default: TanStackRouterDevtools };
    })
  : null;

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  errorComponent: ErrorComponent,
  head: () => ({
    links: [{ href: appCss, rel: "stylesheet" }],
    meta: [
      { charSet: "utf-8" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
      { title: "TanStack Start Template" },
    ],
  }),
  notFoundComponent: NotFoundComponent,
  pendingComponent: PendingComponent,
});

function RootComponent() {
  return (
    <html lang="ja">
      <head>
        <HeadContent />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Outlet />
          {TanStackRouterDevtools ? (
            <Suspense fallback={null}>
              <TanStackRouterDevtools position="bottom-right" />
            </Suspense>
          ) : null}
        </MantineProvider>
        <Scripts />
      </body>
    </html>
  );
}
