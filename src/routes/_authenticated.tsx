import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";

import { PendingComponent } from "~/components/layouts/pending";
import { BoardHeader } from "~/features/dashboard/components/board-header";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <PendingComponent />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-dvh px-4 py-5 pb-16 sm:px-8 sm:py-6">
      <BoardHeader />
      <Outlet />
    </div>
  );
}
