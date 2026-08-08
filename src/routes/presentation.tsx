import { createFileRoute } from "@tanstack/react-router";

import { PresentationDeck } from "~/features/presentation/components/presentation-deck";

export const Route = createFileRoute("/presentation")({
  component: PresentationDeck,
  head: () => ({
    meta: [
      { title: "Convex — Databaseから始まるリアクティブ・バックエンド" },
      {
        content:
          "ConvexをDatabaseから理解する、ソフトウェアエンジニア向け35枚・90分のプレゼンテーション。",
        name: "description",
      },
    ],
  }),
});
