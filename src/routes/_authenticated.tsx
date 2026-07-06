import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";

import { PendingComponent } from "~/components/layouts/pending";
import { UserMenu } from "~/features/auth/components/user-menu";

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
    <div className="min-h-dvh">
      <header className="border-bd flex items-center justify-end border-b px-6 py-3">
        <UserMenu />
      </header>
      <Outlet />
    </div>
  );
}
