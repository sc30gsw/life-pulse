import presentationMarkdown from "../../../docs/convex-engineer-presentation.md?raw";

export type PresentationBadge = "CORE" | "OFFICIAL OPTIONAL" | "THIRD-PARTY / INTEGRATION";

export type PresentationEvidence = {
  label: string;
  url: string;
};

export type PresentationSlide = {
  badges: PresentationBadge[];
  chapter: string;
  closingLine: string;
  diagram: string;
  evidence: PresentationEvidence[];
  lifePulseBridge: string;
  minutes: number;
  number: number;
  projection: string;
  raw: string;
  speakerNotes: string;
  title: string;
};

const SLIDE_MINUTES = [
  2, 2, 3, 3, 3, 3, 2, 2, 2, 2, 1, 3, 3, 3, 2, 2, 2, 8, 3, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 3, 3, 2,
  2, 8,
] as const;

const OPTIONAL_SLIDES = new Set([25, 26, 28]);
const MIXED_SLIDES = new Set([27]);
const INTEGRATION_SLIDES = new Set([31, 32]);

function extractMarkedBlock(block: string, label: string) {
  const marker = `**${label}**`;
  const start = block.indexOf(marker);

  if (start === -1) {
    return "";
  }

  const contentStart = start + marker.length;
  const nextMarker = block.slice(contentStart).search(/\n\*\*[A-Z\p{L}][^\n*]*\*\*/u);
  const value =
    nextMarker === -1
      ? block.slice(contentStart)
      : block.slice(contentStart, contentStart + nextMarker);

  return value.replace(/^\s*:\s*/, "").trim();
}

function extractEvidence(block: string): PresentationEvidence[] {
  const evidence = extractMarkedBlock(block, "Evidence");

  return Array.from(evidence.matchAll(/\[([^\]]+)]\((https?:\/\/[^)]+)\)/g)).flatMap((match) => {
    const label = match[1];
    const url = match[2];

    return label && url ? [{ label, url }] : [];
  });
}

function badgesForSlide(number: number): PresentationBadge[] {
  if (MIXED_SLIDES.has(number)) {
    return ["CORE", "OFFICIAL OPTIONAL"];
  }

  if (OPTIONAL_SLIDES.has(number)) {
    return ["OFFICIAL OPTIONAL"];
  }

  if (INTEGRATION_SLIDES.has(number)) {
    return ["THIRD-PARTY / INTEGRATION"];
  }

  return ["CORE"];
}

export function parsePresentationSource(source: string): PresentationSlide[] {
  const slidePattern =
    /### Slide (\d{2}) — ([^\n]+)\n([\s\S]*?)(?=\n### Slide \d{2} — |\n## \d+\.|\n## デモ実行表|$)/g;

  return Array.from(source.matchAll(slidePattern), (match) => {
    const number = Number(match[1]);
    const precedingSource = source.slice(0, match.index);
    const chapterMatches = Array.from(precedingSource.matchAll(/^## (\d+\.[^\n]+)$/gm));
    const chapter = chapterMatches.at(-1)?.[1]?.trim() ?? "Convex";
    const raw = (match[3] ?? "").trim();

    return {
      badges: badgesForSlide(number),
      chapter,
      closingLine: extractMarkedBlock(raw, "Closing line"),
      diagram: extractMarkedBlock(raw, "図解"),
      evidence: extractEvidence(raw),
      lifePulseBridge: extractMarkedBlock(raw, "Life Pulse bridge"),
      minutes: SLIDE_MINUTES[number - 1] ?? 0,
      number,
      projection: extractMarkedBlock(raw, "投影"),
      raw,
      speakerNotes: extractMarkedBlock(raw, "Speaker notes"),
      title: (match[2] ?? "").trim(),
    };
  });
}

export const presentationSlides = parsePresentationSource(presentationMarkdown);

export const presentationDuration = presentationSlides.reduce(
  (total, slide) => total + slide.minutes,
  0,
);
