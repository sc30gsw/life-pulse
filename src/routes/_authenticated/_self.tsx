import { notifications } from "@mantine/notifications";
import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router";
import { Suspense, useEffect } from "react";

import { PendingComponent } from "~/components/layouts/pending";
import { useViewer } from "~/features/auth/hooks/use-viewer";

export const Route = createFileRoute("/_authenticated/_self")({
  component: SelfOnlyLayout,
});

function SelfOnlyLayout() {
  return (
    <Suspense fallback={<PendingComponent />}>
      <SelfOnlyGuard />
    </Suspense>
  );
}

function SelfOnlyGuard() {
  const { data: viewer } = useViewer();
  const isSelf = viewer?.role === "self";

  useEffect(() => {
    if (!isSelf) {
      notifications.show({
        color: "red",
        message: "パートナーアカウントはこの画面を利用できません",
        title: "アクセスできません",
      });
    }
  }, [isSelf]);

  if (!isSelf) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}
