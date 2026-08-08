import { describe, expect, test } from "vite-plus/test";

import {
  parsePresentationSource,
  presentationDuration,
  presentationSlides,
} from "~/features/presentation/presentation-source";

describe("Convex presentation source", () => {
  test("canonical source yields exactly 35 ordered slides", () => {
    expect(presentationSlides).toHaveLength(35);
    expect(presentationSlides.map((slide) => slide.number)).toEqual(
      Array.from({ length: 35 }, (_, index) => index + 1),
    );
  });

  test("the run of show remains exactly 90 minutes", () => {
    expect(presentationDuration).toBe(90);
  });

  test("keeps projection, notes, evidence, and chapter context", () => {
    const slides = parsePresentationSource(
      "## 2. Database — 3分\n\n### Slide 01 — Test\n\n**投影**\n\nBody\n\n**Speaker notes**: Note\n\n**Evidence**: [Docs](https://docs.convex.dev)",
    );

    expect(slides[0]).toMatchObject({
      chapter: "2. Database — 3分",
      evidence: [{ label: "Docs", url: "https://docs.convex.dev" }],
      projection: "Body",
      speakerNotes: "Note",
      title: "Test",
    });
  });
});
