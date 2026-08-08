import { Badge, Box, Group, Text } from "@mantine/core";
import { Fragment, type ReactNode } from "react";

import { PresentationTimingChart } from "~/features/presentation/components/presentation-timing-chart";
import type {
  PresentationBadge,
  PresentationSlide,
} from "~/features/presentation/presentation-source";

const BADGE_CLASSES: Record<PresentationBadge, string> = {
  CORE: "border-good/45 bg-good/12 text-good",
  "OFFICIAL OPTIONAL": "border-violet/45 bg-violet/12 text-violet",
  "THIRD-PARTY / INTEGRATION": "border-blue/45 bg-blue/12 text-blue",
};

function inlineNodes(value: string): ReactNode[] {
  const tokenPattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+]\([^)]+\))/g;

  return value.split(tokenPattern).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          className="border-bd-2 bg-inset text-good rounded border px-[0.34em] py-[0.08em]"
          key={`${part}-${index}`}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    const link = part.match(/^\[([^\]]+)]\(([^)]+)\)$/);

    if (link) {
      return (
        <a
          className="text-blue decoration-blue/35 underline underline-offset-4"
          href={link[2]}
          key={`${part}-${index}`}
          rel="noreferrer"
          target="_blank"
        >
          {link[1]}
        </a>
      );
    }

    return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
  });
}

function InlineMarkdown({ value }: { value: string }) {
  return <>{inlineNodes(value)}</>;
}

function isTableDivider(line: string) {
  return /^\|?\s*:?-{3,}/.test(line);
}

function tableCells(line: string) {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function ProjectionContent({ value }: { value: string }) {
  const lines = value.split("\n");
  const blocks: ReactNode[] = [];
  let cursor = 0;

  while (cursor < lines.length) {
    const line = lines[cursor]?.trimEnd() ?? "";

    if (!line.trim()) {
      cursor += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const code: string[] = [];
      cursor += 1;

      while (cursor < lines.length && !lines[cursor]?.trim().startsWith("```")) {
        code.push(lines[cursor] ?? "");
        cursor += 1;
      }

      cursor += 1;
      blocks.push(
        <div className="relative min-w-0" key={`code-${cursor}`}>
          {language ? (
            <span className="text-faint absolute top-2 right-3 text-[0.58em] tracking-[0.14em] uppercase">
              {language}
            </span>
          ) : null}
          <pre className="border-bd-2 bg-inset max-h-[30vh] overflow-auto rounded-xl border p-[0.8em] pr-16 text-left text-[0.72em] leading-[1.55]">
            <code>{code.join("\n")}</code>
          </pre>
        </div>,
      );
      continue;
    }

    if (line.trim().startsWith("|") && isTableDivider(lines[cursor + 1]?.trim() ?? "")) {
      const rows: string[][] = [tableCells(line)];
      cursor += 2;

      while (cursor < lines.length && lines[cursor]?.trim().startsWith("|")) {
        rows.push(tableCells(lines[cursor] ?? ""));
        cursor += 1;
      }

      blocks.push(
        <div
          className="border-bd-2 bg-inset overflow-auto rounded-xl border"
          key={`table-${cursor}`}
        >
          <table className="w-full border-collapse text-left text-[0.68em] leading-[1.4]">
            <thead>
              <tr className="border-bd-2 text-good border-b">
                {rows[0]?.map((cell) => (
                  <th className="px-[0.8em] py-[0.65em] font-semibold" key={cell}>
                    <InlineMarkdown value={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, rowIndex) => (
                <tr className="border-bd border-b last:border-0" key={`row-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td className="px-[0.8em] py-[0.56em] align-top" key={`${cell}-${cellIndex}`}>
                      <InlineMarkdown value={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (/^[-*] /.test(line.trim())) {
      const items: string[] = [];

      while (cursor < lines.length && /^[-*] /.test(lines[cursor]?.trim() ?? "")) {
        items.push((lines[cursor] ?? "").trim().replace(/^[-*] /, ""));
        cursor += 1;
      }

      blocks.push(
        <ul className="grid gap-[0.44em] pl-[1.25em] text-left" key={`list-${cursor}`}>
          {items.map((item, index) => (
            <li className="marker:text-good pl-[0.18em]" key={`${item}-${index}`}>
              <InlineMarkdown value={item} />
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\. /.test(line.trim())) {
      const items: string[] = [];

      while (cursor < lines.length && /^\d+\. /.test(lines[cursor]?.trim() ?? "")) {
        items.push((lines[cursor] ?? "").trim().replace(/^\d+\. /, ""));
        cursor += 1;
      }

      blocks.push(
        <ol className="grid gap-[0.38em] pl-[1.4em] text-left" key={`ordered-${cursor}`}>
          {items.map((item, index) => (
            <li className="marker:text-amber pl-[0.2em]" key={`${item}-${index}`}>
              <InlineMarkdown value={item} />
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    if (line.trim().startsWith(">")) {
      const quote: string[] = [];

      while (cursor < lines.length && lines[cursor]?.trim().startsWith(">")) {
        quote.push((lines[cursor] ?? "").trim().replace(/^>\s?/, ""));
        cursor += 1;
      }

      blocks.push(
        <blockquote
          className="border-good bg-good/8 rounded-r-xl border-l-2 px-[0.9em] py-[0.7em] text-left leading-[1.45] font-semibold"
          key={`quote-${cursor}`}
        >
          <InlineMarkdown value={quote.join(" ")} />
        </blockquote>,
      );
      continue;
    }

    const paragraph: string[] = [line.trim()];
    cursor += 1;

    while (
      cursor < lines.length &&
      lines[cursor]?.trim() &&
      !lines[cursor]?.trim().startsWith("```") &&
      !lines[cursor]?.trim().startsWith("|") &&
      !/^[-*] /.test(lines[cursor]?.trim() ?? "") &&
      !/^\d+\. /.test(lines[cursor]?.trim() ?? "") &&
      !lines[cursor]?.trim().startsWith(">")
    ) {
      paragraph.push(lines[cursor]?.trim() ?? "");
      cursor += 1;
    }

    blocks.push(
      <p className="m-0 text-left leading-[1.55]" key={`paragraph-${cursor}`}>
        <InlineMarkdown value={paragraph.join(" ")} />
      </p>,
    );
  }

  return <div className="grid min-w-0 content-center gap-[0.7em]">{blocks}</div>;
}

function DatabasePulse({ caption }: { caption: string }) {
  return (
    <div className="border-bd-2 bg-inset relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border p-[1.1em]">
      <div
        aria-hidden
        className="border-good/25 absolute aspect-square h-[72%] rounded-full border"
      />
      <div
        aria-hidden
        className="border-good/15 absolute aspect-square h-[50%] rounded-full border"
      />
      <div className="relative z-10 grid w-full max-w-[24em] grid-cols-2 gap-[0.65em] text-[0.58em] tracking-[0.11em] uppercase">
        <span className="border-blue/35 bg-blue/10 text-blue rounded-lg border px-[0.7em] py-[0.6em] text-center">
          query / subscribe
        </span>
        <span className="border-coral/35 bg-coral/10 text-coral rounded-lg border px-[0.7em] py-[0.6em] text-center">
          mutation / commit
        </span>
        <span className="border-violet/35 bg-violet/10 text-violet rounded-lg border px-[0.7em] py-[0.6em] text-center">
          actions / workflow
        </span>
        <span className="border-amber/35 bg-amber/10 text-amber rounded-lg border px-[0.7em] py-[0.6em] text-center">
          operations / limits
        </span>
        <span className="border-good bg-panel text-good col-span-2 mx-auto rounded-xl border px-[1.4em] py-[0.9em] text-center text-[1.25em] font-bold tracking-[0.18em] shadow-[0_0_34px_color-mix(in_oklab,var(--good)_18%,transparent)]">
          DATABASE
        </span>
      </div>
      {caption ? (
        <p className="text-faint absolute inset-x-[1em] bottom-[0.7em] m-0 line-clamp-2 text-center text-[0.48em] leading-[1.4]">
          {caption}
        </p>
      ) : null}
    </div>
  );
}

export function PresentationSlideCanvas({ slide }: { slide: PresentationSlide }) {
  const isDense = slide.projection.length > 780;
  const isTitle = slide.number === 1;

  return (
    <section
      aria-labelledby={`slide-${slide.number}-title`}
      className="border-bd-2 bg-panel shadow-card relative aspect-video w-full overflow-hidden rounded-[clamp(12px,1.5vw,24px)] border"
      data-slide-number={slide.number}
    >
      <div aria-hidden className="presentation-grid absolute inset-0 opacity-35" />
      <div aria-hidden className="bg-good/50 absolute top-0 left-0 h-[2px] w-[32%]" />
      <div className="relative z-10 flex h-full flex-col px-[clamp(1rem,3.4vw,3.4rem)] py-[clamp(0.8rem,2.5vw,2.6rem)]">
        <header className="mb-[clamp(0.45rem,1.2vw,1.15rem)] flex items-start gap-[1em]">
          <div className="min-w-0 flex-1">
            <Text
              c="var(--faint)"
              fw={700}
              size="clamp(0.46rem, 0.72vw, 0.78rem)"
              tt="uppercase"
              style={{ letterSpacing: "0.15em" }}
            >
              {slide.chapter}
            </Text>
            <h2
              className={`m-0 mt-[0.24em] leading-[1.13] font-bold tracking-[-0.04em] text-balance ${
                isTitle
                  ? "max-w-[16em] text-[clamp(1.45rem,3.3vw,4.1rem)]"
                  : "text-[clamp(0.92rem,2.12vw,2.65rem)]"
              }`}
              id={`slide-${slide.number}-title`}
            >
              {slide.title}
            </h2>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-[0.5em]">
            <span className="text-good text-[clamp(0.7rem,1.4vw,1.35rem)] font-bold tracking-[-0.04em]">
              {String(slide.number).padStart(2, "0")}
            </span>
            <Group gap={5} justify="flex-end">
              {slide.badges.map((badge) => (
                <Badge
                  className={`${BADGE_CLASSES[badge]} border text-[clamp(0.32rem,0.52vw,0.58rem)]`}
                  key={badge}
                  radius="sm"
                  variant="transparent"
                >
                  {badge}
                </Badge>
              ))}
            </Group>
          </div>
        </header>

        <div
          className={`grid min-h-0 flex-1 gap-[clamp(0.6rem,1.5vw,1.5rem)] ${
            isTitle || slide.diagram || slide.number === 2
              ? "grid-cols-1 sm:grid-cols-[minmax(0,1.08fr)_minmax(13rem,0.92fr)]"
              : "grid-cols-1"
          }`}
        >
          <Box
            className={`min-w-0 self-center ${
              isDense
                ? "text-[clamp(0.45rem,0.82vw,0.92rem)]"
                : "text-[clamp(0.55rem,1.08vw,1.25rem)]"
            }`}
          >
            <ProjectionContent value={slide.projection} />
            {slide.closingLine ? (
              <div className="border-good bg-good/8 mt-[0.8em] rounded-r-xl border-l-2 px-[0.9em] py-[0.65em] leading-[1.45] font-semibold">
                <ProjectionContent value={slide.closingLine} />
              </div>
            ) : null}
          </Box>

          {slide.number === 2 ? (
            <div className="border-bd-2 bg-inset hidden min-w-0 self-center rounded-2xl border p-[0.55em] text-[0.68em] sm:block">
              <PresentationTimingChart />
            </div>
          ) : isTitle || slide.diagram ? (
            <div className="hidden min-h-0 sm:flex">
              <DatabasePulse caption={slide.diagram} />
            </div>
          ) : null}
        </div>

        <footer className="border-bd mt-[clamp(0.4rem,1vw,0.9rem)] flex items-center gap-[0.8em] border-t pt-[clamp(0.35rem,0.8vw,0.7rem)] text-[clamp(0.38rem,0.57vw,0.62rem)]">
          <span className="text-faint shrink-0 tracking-[0.13em] uppercase">Primary source</span>
          <span className="text-dim min-w-0 flex-1 truncate">
            {slide.evidence.map((item) => item.label).join(" · ") || "Convex Developer Hub"}
          </span>
          <span className="text-amber shrink-0">{slide.minutes} min</span>
        </footer>
      </div>
    </section>
  );
}
