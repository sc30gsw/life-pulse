/// <reference types="vite-plus/client" />
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { ShimmerProvider } from "@shimmer-from-structure/react";
import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";
import { HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

import { ErrorComponent } from "~/components/layouts/error";
import { NotFoundComponent } from "~/components/layouts/not-found";
import { PendingComponent } from "~/components/layouts/pending";
import { theme } from "~/lib/theme";

import notificationsCss from "@mantine/notifications/styles.css?url";
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
    links: [
      { href: "https://fonts.googleapis.com", rel: "preconnect" },
      { crossOrigin: "anonymous", href: "https://fonts.gstatic.com", rel: "preconnect" },
      {
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap",
        rel: "stylesheet",
      },
      { href: appCss, rel: "stylesheet" },
      { href: notificationsCss, rel: "stylesheet" },
    ],
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
        <MantineProvider defaultColorScheme="dark" theme={theme}>
          <ShimmerProvider
            config={{
              backgroundColor: "var(--inset)",
              shimmerColor: "var(--bd2)",
              duration: 2,
              fallbackBorderRadius: 8,
            }}
          >
            <ModalsProvider>
              <Notifications position="top-center" />
              <Outlet />
              {TanStackRouterDevtools ? (
                <Suspense fallback={null}>
                  <TanStackRouterDevtools />
                </Suspense>
              ) : null}
            </ModalsProvider>
          </ShimmerProvider>
        </MantineProvider>
        <Scripts />
      </body>
    </html>
  );
}
