import { createFileRoute } from "@tanstack/react-router";

import { ConvexBestPracticesPage } from "~/features/presentation/components/convex-best-practices";

export const Route = createFileRoute("/convex-best-practices")({
  component: ConvexBestPracticesPage,
  head: () => ({
    meta: [
      { title: "Convex Field Guide — Best Practices" },
      {
        content:
          "Convex公式ドキュメントとagent guidelinesを統合した、実装・認可・運用のベストプラクティス。",
        name: "description",
      },
    ],
  }),
});
