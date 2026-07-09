import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router";
import { useConvexAuth, useQuery } from "convex/react";

import { api } from "~/../convex/_generated/api";
import { PendingComponent } from "~/components/layouts/pending";
import { BoardHeader } from "~/features/dashboard/components/board-header";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const secondFactorStatus = useQuery(
    api.queries.auth.secondFactorStatus.secondFactorStatus,
    isAuthenticated ? {} : "skip",
  );

  if (isLoading) {
    return <PendingComponent />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (secondFactorStatus === undefined) {
    return <PendingComponent />;
  }

  if (secondFactorStatus.required && !secondFactorStatus.verified) {
    return <Navigate to="/verify-otp" />;
  }

  return (
    <div className="min-h-dvh px-4 py-5 pb-16 sm:px-8 sm:py-6">
      <BoardHeader />
      <Outlet />
    </div>
  );
}
