import {
  ActionIcon,
  Badge,
  Button,
  Drawer,
  Group,
  Progress,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconArrowLeft,
  IconArrowRight,
  IconArrowsMaximize,
  IconBook2,
  IconLayoutGrid,
  IconNotes,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useSyncExternalStore } from "react";

import { PresentationSlideCanvas } from "~/features/presentation/components/presentation-slide";
import {
  presentationDuration,
  presentationSlides,
  type PresentationSlide,
} from "~/features/presentation/presentation-source";

const chapterShortName: Record<string, string> = {
  "1": "INTRO",
  "2": "DATABASE",
  "3": "FUNCTIONS / REALTIME",
  "4": "PRODUCTION",
  "5": "COMPONENTS / AI / OPS",
  "6": "ADOPTION",
};

const SLIDE_CHANGE_EVENT = "life-pulse-presentation-slide-change";

function boundedIndex(index: number) {
  return Math.min(Math.max(index, 0), presentationSlides.length - 1);
}

function updateSlideUrl(index: number) {
  const url = new URL(window.location.href);
  url.searchParams.set("slide", String(index + 1));
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(SLIDE_CHANGE_EVENT));
}

function goToSlide(nextIndex: number) {
  updateSlideUrl(boundedIndex(nextIndex));
}

function slideFromLocation() {
  if (typeof window === "undefined") {
    return 0;
  }

  const requested = Number(new URLSearchParams(window.location.search).get("slide"));

  return Number.isInteger(requested) && requested >= 1 && requested <= presentationSlides.length
    ? requested - 1
    : 0;
}

function subscribeToSlideUrl(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  window.addEventListener(SLIDE_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("popstate", onStoreChange);
    window.removeEventListener(SLIDE_CHANGE_EVENT, onStoreChange);
  };
}

async function requestFullscreen() {
  if (!document.fullscreenElement) {
    const stage = document.querySelector<HTMLElement>("[data-presentation-stage]");
    await stage?.requestFullscreen();
    return;
  }

  await document.exitFullscreen();
}

function DeckHeader({
  onMapOpen,
  onNotesOpen,
}: {
  onMapOpen: () => void;
  onNotesOpen: () => void;
}) {
  return (
    <header className="mx-auto mb-3 flex w-full max-w-[1560px] flex-wrap items-center gap-3 sm:mb-5">
      <Group gap={10} mr="auto">
        <span className="bg-good lp-pulse h-2.5 w-2.5 rounded-full shadow-[0_0_12px_var(--good)]" />
        <Stack gap={0}>
          <Text className="lp-brandtext" fw={700} size="md">
            Convex · Reactive Backend
          </Text>
          <Text
            c="var(--faint)"
            fw={600}
            size="10px"
            tt="uppercase"
            style={{ letterSpacing: "0.13em" }}
          >
            35 slides · {presentationDuration} minutes · local deck
          </Text>
        </Stack>
      </Group>

      <Group gap={7}>
        <Button
          className="border-bd-2 bg-inset text-tx hover:bg-panel-2"
          component={Link}
          leftSection={<IconBook2 size={15} />}
          radius="md"
          size="xs"
          to="/convex-best-practices"
          variant="default"
        >
          Best Practices
        </Button>
        <Tooltip label="スライド一覧">
          <ActionIcon
            aria-label="スライド一覧を開く"
            className="border-bd-2 bg-inset text-tx hover:bg-panel-2"
            onClick={onMapOpen}
            radius="md"
            variant="default"
          >
            <IconLayoutGrid size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="発表者ノート">
          <ActionIcon
            aria-label="発表者ノートを開く"
            className="border-bd-2 bg-inset text-tx hover:bg-panel-2"
            onClick={onNotesOpen}
            radius="md"
            variant="default"
          >
            <IconNotes size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="全画面表示">
          <ActionIcon
            aria-label="全画面表示を切り替える"
            className="border-bd-2 bg-inset text-tx hover:bg-panel-2"
            onClick={requestFullscreen}
            radius="md"
            variant="default"
          >
            <IconArrowsMaximize size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </header>
  );
}

function DeckControls({
  chapterNumber,
  currentIndex,
  elapsedMinutes,
  onSelect,
}: {
  chapterNumber: string;
  currentIndex: number;
  elapsedMinutes: number;
  onSelect: (index: number) => void;
}) {
  return (
    <>
      <div className="mt-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 sm:mt-4 sm:gap-5">
        <ActionIcon
          aria-label="前のスライド"
          className="border-bd-2 bg-panel text-tx hover:bg-panel-2 disabled:opacity-35"
          disabled={currentIndex === 0}
          onClick={() => onSelect(currentIndex - 1)}
          radius="md"
          size="lg"
          variant="default"
        >
          <IconArrowLeft size={18} />
        </ActionIcon>

        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] uppercase">
            <span className="text-good truncate">
              {chapterShortName[chapterNumber] ?? "CONVEX"}
            </span>
            <span className="text-faint ml-auto shrink-0">
              {elapsedMinutes} / {presentationDuration} min
            </span>
            <span className="text-dim shrink-0">
              {currentIndex + 1} / {presentationSlides.length}
            </span>
          </div>
          <Progress
            aria-label={`プレゼンテーション進捗 ${currentIndex + 1} / ${presentationSlides.length}`}
            color="var(--good)"
            radius="xl"
            size="sm"
            value={((currentIndex + 1) / presentationSlides.length) * 100}
          />
        </div>

        <ActionIcon
          aria-label="次のスライド"
          className="border-good/45 bg-good/10 text-good hover:bg-good/18 disabled:opacity-35"
          disabled={currentIndex === presentationSlides.length - 1}
          onClick={() => onSelect(currentIndex + 1)}
          radius="md"
          size="lg"
          variant="default"
        >
          <IconArrowRight size={18} />
        </ActionIcon>
      </div>

      <Text c="var(--faint)" mt="sm" size="10px" ta="center">
        ← → / Page Up / Page Down / Space · Home / End · クリックで次へ
      </Text>
    </>
  );
}

function SlideMapDrawer({
  currentIndex,
  onClose,
  onSelect,
  opened,
}: {
  currentIndex: number;
  onClose: () => void;
  onSelect: (index: number) => void;
  opened: boolean;
}) {
  return (
    <Drawer
      classNames={{
        body: "bg-panel px-4 pb-6",
        content: "bg-panel text-tx border-l border-bd-2",
        header: "bg-panel border-b border-bd",
        title: "font-mono font-bold",
      }}
      onClose={onClose}
      opened={opened}
      position="right"
      size="min(560px, 92vw)"
      title="全35枚 — Deck Map"
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {presentationSlides.map((slide, index) => (
          <button
            className={`focus-visible:outline-blue min-h-24 rounded-xl border p-3 text-left transition focus-visible:outline-2 ${
              index === currentIndex
                ? "border-good bg-good/10"
                : "border-bd-2 bg-inset hover:border-blue/60 hover:bg-panel-2"
            }`}
            key={slide.number}
            onClick={() => {
              onSelect(index);
              onClose();
            }}
            type="button"
          >
            <span className="text-good text-xs font-bold">
              {String(slide.number).padStart(2, "0")}
            </span>
            <span className="mt-2 block text-[11px] leading-[1.45] font-semibold">
              {slide.title}
            </span>
            <span className="text-faint mt-2 block text-[9px] tracking-[0.1em] uppercase">
              {slide.minutes} min
            </span>
          </button>
        ))}
      </div>
    </Drawer>
  );
}

function SpeakerNotesDrawer({
  onClose,
  opened,
  slide,
}: {
  onClose: () => void;
  opened: boolean;
  slide: PresentationSlide;
}) {
  return (
    <Drawer
      classNames={{
        body: "bg-panel px-5 pb-8",
        content: "bg-panel text-tx border-l border-bd-2",
        header: "bg-panel border-b border-bd",
        title: "font-mono font-bold",
      }}
      onClose={onClose}
      opened={opened}
      position="right"
      scrollAreaComponent={ScrollArea.Autosize}
      size="min(620px, 94vw)"
      title={`Speaker notes · ${String(slide.number).padStart(2, "0")}`}
    >
      <Stack gap="lg">
        <div>
          <Badge className="border-good/45 bg-good/12 text-good border" variant="transparent">
            {slide.minutes} min
          </Badge>
          <Text fw={700} mt="sm" size="lg">
            {slide.title}
          </Text>
        </div>

        <div className="border-bd-2 bg-inset rounded-xl border p-4">
          <Text
            c="var(--faint)"
            fw={700}
            mb="sm"
            size="10px"
            tt="uppercase"
            style={{ letterSpacing: "0.13em" }}
          >
            Talk track
          </Text>
          <Text className="whitespace-pre-wrap" lh={1.7} size="sm">
            {slide.speakerNotes || "このスライドに個別ノートはありません。"}
          </Text>
        </div>

        {slide.lifePulseBridge ? (
          <div className="border-blue/35 bg-blue/8 rounded-xl border p-4">
            <Text
              c="var(--blue)"
              fw={700}
              mb="xs"
              size="10px"
              tt="uppercase"
              style={{ letterSpacing: "0.13em" }}
            >
              Life Pulse bridge
            </Text>
            <Text className="whitespace-pre-wrap" lh={1.65} size="sm">
              {slide.lifePulseBridge}
            </Text>
          </div>
        ) : null}

        <div>
          <Text
            c="var(--faint)"
            fw={700}
            mb="sm"
            size="10px"
            tt="uppercase"
            style={{ letterSpacing: "0.13em" }}
          >
            Primary sources
          </Text>
          <Stack gap="xs">
            {slide.evidence.map((item) => (
              <a
                className="border-bd-2 bg-inset text-blue decoration-blue/35 rounded-lg border px-3 py-2 text-xs underline underline-offset-4"
                href={item.url}
                key={item.url}
                rel="noreferrer"
                target="_blank"
              >
                {item.label} ↗
              </a>
            ))}
          </Stack>
        </div>
      </Stack>
    </Drawer>
  );
}

export function PresentationDeck() {
  const currentIndex = useSyncExternalStore(subscribeToSlideUrl, slideFromLocation, () => 0);
  const [mapOpened, mapControls] = useDisclosure(false);
  const [notesOpened, notesControls] = useDisclosure(false);
  const currentSlide = presentationSlides[currentIndex];
  const elapsedMinutes = presentationSlides
    .slice(0, currentIndex + 1)
    .reduce((sum, slide) => sum + slide.minutes, 0);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }

      const relativeMove =
        event.key === "ArrowRight" || event.key === "PageDown" || event.key === " "
          ? 1
          : event.key === "ArrowLeft" || event.key === "PageUp"
            ? -1
            : 0;

      if (relativeMove !== 0) {
        event.preventDefault();
        updateSlideUrl(boundedIndex(slideFromLocation() + relativeMove));
      }

      if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        const next = event.key === "Home" ? 0 : presentationSlides.length - 1;
        updateSlideUrl(next);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!currentSlide) {
    return null;
  }

  const chapterNumber = currentSlide.chapter.match(/^(\d+)/)?.[1] ?? "1";

  return (
    <div className="min-h-dvh px-3 py-3 sm:px-6 sm:py-5">
      <DeckHeader onMapOpen={mapControls.open} onNotesOpen={notesControls.open} />

      <main
        className="mx-auto w-full"
        style={{ maxWidth: "min(1560px, calc((100dvh - 10.5rem) * 1.7778))" }}
      >
        <div className="relative" data-presentation-stage>
          <PresentationSlideCanvas slide={currentSlide} />
          <button
            aria-label="次のスライドへ進む"
            className="focus-visible:outline-blue absolute inset-0 z-20 cursor-pointer rounded-[clamp(12px,1.5vw,24px)] bg-transparent focus-visible:outline-2 focus-visible:outline-offset-4"
            disabled={currentIndex === presentationSlides.length - 1}
            onClick={() => goToSlide(currentIndex + 1)}
            type="button"
          />
        </div>

        <DeckControls
          chapterNumber={chapterNumber}
          currentIndex={currentIndex}
          elapsedMinutes={elapsedMinutes}
          onSelect={goToSlide}
        />
      </main>

      <SlideMapDrawer
        currentIndex={currentIndex}
        onClose={mapControls.close}
        onSelect={goToSlide}
        opened={mapOpened}
      />
      <SpeakerNotesDrawer onClose={notesControls.close} opened={notesOpened} slide={currentSlide} />
    </div>
  );
}
