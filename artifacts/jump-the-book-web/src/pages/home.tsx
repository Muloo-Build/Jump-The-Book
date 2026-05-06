import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import {
  Sparkles,
  BookOpen,
  ImageIcon,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Upload,
  Search,
  Layers,
  Headphones,
  Tablet,
  CheckCheck,
  MessageSquareText,
  Library,
  Loader2,
  Monitor,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookSearch, type BookSearchResult } from "@/hooks/useApiLibrary";

/**
 * ScrollBunny: A scroll-reactive bunny matching the front-facing logo grammar.
 * It tracks the page scroll progress and descends a vertical track on the right side
 * of the screen, leaving a faint magenta trail above it that brightens with progress.
 *
 * Accessibility:
 *   - Decorative, so the wrapper is aria-hidden. We don't want screen readers to
 *     announce a bunny moving as the user scrolls.
 *   - Honours `prefers-reduced-motion`: when the user has reduced motion enabled
 *     we render the bunny statically at the top of its track (no spring, no
 *     transform-driven movement) so vestibular sensitivity isn't triggered.
 *
 * Implementation note:
 *   - We animate `top` (a percentage of the parent track's height) rather than a
 *     transform because percentage-based transforms in framer-motion resolve
 *     against the element's own size, not the parent track's. For a single small
 *     fixed element the layout cost is negligible.
 */
function ScrollBunny() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 20,
    stiffness: 100,
    mass: 0.8,
  });
  const yPos = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  return (
    <div
      aria-hidden="true"
      className="fixed right-4 sm:right-8 top-24 bottom-24 w-[2px] rounded-full bg-gradient-to-b from-transparent via-[var(--jtb-spark-soft)] to-transparent z-40 hidden md:block pointer-events-none"
    >
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
        style={prefersReducedMotion ? { top: "0%" } : { top: yPos }}
      >
        <motion.div
          className="w-[1px] h-12 bg-gradient-to-b from-transparent to-[var(--jtb-spark)] origin-bottom"
          style={prefersReducedMotion ? { opacity: 0.6 } : { opacity: smoothProgress }}
        />
        <div className="relative w-8 h-8 filter drop-shadow-[0_0_8px_var(--jtb-spark)]">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full overflow-visible"
            focusable="false"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bunny-ear" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E6C885"></stop>
                <stop offset="100%" stopColor="#C9A96A"></stop>
              </linearGradient>
              <radialGradient id="bunny-head" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#E6C885"></stop>
                <stop offset="70%" stopColor="#C9A96A"></stop>
                <stop offset="100%" stopColor="#8E7339"></stop>
              </radialGradient>
            </defs>
            {/* Ears */}
            <rect x="32" y="10" width="12" height="40" rx="6" fill="url(#bunny-ear)" transform="rotate(-12 38 30)"></rect>
            <rect x="56" y="10" width="12" height="40" rx="6" fill="url(#bunny-ear)" transform="rotate(12 62 30)"></rect>
            {/* Inner Ears */}
            <rect x="35" y="18" width="6" height="26" rx="3" fill="#08080B" transform="rotate(-12 38 30)"></rect>
            <rect x="59" y="18" width="6" height="26" rx="3" fill="#08080B" transform="rotate(12 62 30)"></rect>
            {/* Head */}
            <circle cx="50" cy="62" r="26" fill="url(#bunny-head)"></circle>
            {/* Eyes */}
            <circle cx="40" cy="58" r="3" fill="#08080B"></circle>
            <circle cx="60" cy="58" r="3" fill="#08080B"></circle>
            {/* Nose */}
            <path d="M50 67 L47 71 L53 71 Z" fill="#08080B"></path>
          </svg>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Signed-out landing screen.
 */

interface Showcase {
  src: string;
  coverSrc: string;
  title: string;
  author: string;
  caption: string;
  gradient: string;
  proof: string;
}

const SHOWCASE: Showcase[] = [
  {
    src: "scenes/landing/dcc.png",
    coverSrc: "https://covers.openlibrary.org/b/isbn/0593820248-L.jpg",
    title: "Dungeon Crawler Carl",
    author: "Matt Dinniman",
    caption: "Floor 1, the stairs down.",
    gradient: "linear-gradient(135deg, #1a0a1f, #4a0a3a, #8a1f6a)",
    proof: "Title recognised, cover matched, chapter scene painted.",
  },
  {
    src: "scenes/landing/phm.png",
    coverSrc: "https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg",
    title: "Project Hail Mary",
    author: "Andy Weir",
    caption: "First contact, in the dark.",
    gradient: "linear-gradient(135deg, #06121f, #0a2440, #2a4a7a)",
    proof: "Reader, scene history, and resume point stay together.",
  },
  {
    src: "scenes/landing/fourthwing.png",
    coverSrc: "https://covers.openlibrary.org/b/isbn/9781649374042-L.jpg",
    title: "Fourth Wing",
    author: "Rebecca Yarros",
    caption: "On the parapet at Basgiath.",
    gradient: "linear-gradient(135deg, #0a0612, #2a0a3a, #4a1a6a)",
    proof: "Same book identity from setup to painted chapter.",
  },
  {
    src: "scenes/landing/stormlight.png",
    coverSrc: "https://covers.openlibrary.org/b/isbn/9780765365279-L.jpg",
    title: "The Way of Kings",
    author: "Brandon Sanderson",
    caption: "A highstorm on the Shattered Plains.",
    gradient: "linear-gradient(135deg, #0a0a1a, #1a1a3a, #3a3a7a)",
    proof: "Works for giant series too, not just one-off scenes.",
  },
  {
    src: "scenes/landing/acotar.png",
    coverSrc: "https://covers.openlibrary.org/b/isbn/9781619634442-L.jpg",
    title: "A Court of Thorns and Roses",
    author: "Sarah J. Maas",
    caption: "The Spring Court, by moonlight.",
    gradient: "linear-gradient(135deg, #0a1a0e, #1a3a2a, #4a6a4a)",
    proof: "Save it to your shelf, then keep painting as you read.",
  },
  {
    src: "scenes/landing/dune.png",
    coverSrc: "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg",
    title: "Dune",
    author: "Frank Herbert",
    caption: "A worm crests the dune.",
    gradient: "linear-gradient(135deg, #1a0a04, #4a1a08, #8a4a1a)",
    proof: "Recognised even when you start from metadata first.",
  },
  {
    src: "scenes/landing/mistborn.png",
    coverSrc: "https://covers.openlibrary.org/b/isbn/9780765311788-L.jpg",
    title: "Mistborn: The Final Empire",
    author: "Brandon Sanderson",
    caption: "Mist over Luthadel.",
    gradient: "linear-gradient(135deg, #1a0a08, #3a0a08, #6a1a18)",
    proof: "Formats, progress, and scenes all stay attached to the title.",
  },
  {
    src: "scenes/landing/nameofthewind.png",
    coverSrc: "https://covers.openlibrary.org/b/isbn/9780756404741-L.jpg",
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    caption: "Silence at the Waystone Inn.",
    gradient: "linear-gradient(135deg, #0a0608, #2a1408, #4a2a18)",
    proof: "Search the title, pick the book, paint the exact chapter.",
  },
];

const STORY_FEATURES = [
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Spoiler-safe chapter paint",
    body: "The scene is locked to where you are in the book, so the app can stay cinematic without jumping ahead.",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "Built-in reader that resumes",
    body: "EPUBs reopen where you left off, and the scene button stays right there while you read.",
  },
  {
    icon: <MessageSquareText className="w-5 h-5" />,
    title: "Rate and review when you're done",
    body: "Finished a book? Leave a star rating, keep it private, or share it to Trending when it's worth showing off.",
  },
  {
    icon: <Library className="w-5 h-5" />,
    title: "Shelf, formats, and imports",
    body: "Paperback, ebook, audiobook, imported shelf, recognized title, painted scenes. It all lands in one library.",
  },
] as const;

const QUICK_PICKS = [
  "Project Hail Mary",
  "Fourth Wing",
  "The Way of Kings",
  "Dungeon Crawler Carl",
] as const;

function normalizeBookTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function canonicalBookTitle(value: string): string {
  return normalizeBookTitle(value).split(" ").slice(0, 6).join(" ");
}

function findShowcaseMatch(value: string | Pick<BookSearchResult, "title">): Showcase | null {
  const title = typeof value === "string" ? value : value.title;
  const target = canonicalBookTitle(title);
  return (
    SHOWCASE.find((item) => {
      const own = canonicalBookTitle(item.title);
      return own === target || own.startsWith(target) || target.startsWith(own);
    }) ?? null
  );
}

type TryPreview =
  | { kind: "recognized"; item: Showcase }
  | { kind: "search"; result: BookSearchResult };

const BASE = import.meta.env.BASE_URL;

const WALKTHROUGH_SHELF = [
  { title: "Mistborn", author: "Brandon Sanderson", src: "scenes/landing/mistborn.png" },
  { title: "Project Hail Mary", author: "Andy Weir", src: "scenes/landing/phm.png" },
  { title: "Dungeon Crawler Carl", author: "Matt Dinniman", src: "scenes/landing/dcc.png" },
  { title: "The Way of Kings", author: "Brandon Sanderson", src: "scenes/landing/stormlight.png" },
];

const WALKTHROUGH_CHAPTERS = [
  { n: 1, title: "Who am I?" },
  { n: 2, title: "The Hail Mary" },
  { n: 3, title: "Astrophage" },
  { n: 4, title: "A passenger" },
  { n: 5, title: "Tau Ceti" },
  { n: 6, title: "Something out there" },
  { n: 7, title: "First contact" },
];

const STEP_CAPTIONS = [
  "Step 1 — pick the book you're reading.",
  "Step 2 — tap the chapter you're on.",
  "Step 3 — the scene, painted just for that moment.",
];

const screenMotion = {
  initial: { opacity: 0, x: 14 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -14 },
  transition: { duration: 0.32, ease: "easeOut" as const },
};

function ScreenPickBook({ onSelect }: { onSelect: () => void }) {
  return (
    <motion.div {...screenMotion} className="absolute inset-0 pt-9 flex flex-col">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <p className="font-serif text-[15px] text-foreground">Your shelf</p>
        <div className="w-7 h-7 rounded-full bg-primary/30 ring-1 ring-primary/40" />
      </div>
      <div className="px-3 pb-3 space-y-2 flex-1 overflow-hidden">
        {WALKTHROUGH_SHELF.map((b) => {
          const isTarget = b.title === "Project Hail Mary";
          return (
            <button
              key={b.title}
              onClick={isTarget ? onSelect : undefined}
              className={cn(
                "w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all",
                isTarget
                  ? "bg-primary/15 ring-1 ring-primary/50 shadow-[0_0_24px_-4px_rgba(242,42,140,0.5)]"
                  : "bg-foreground/5 ring-1 ring-foreground/10 opacity-70",
              )}
              aria-label={isTarget ? `Open ${b.title}` : undefined}
              tabIndex={isTarget ? 0 : -1}
            >
              <img
                src={`${BASE}${b.src}`}
                alt=""
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">
                  {b.author}
                </p>
                <p className="font-serif text-[13px] leading-tight text-foreground truncate">
                  {b.title}
                </p>
              </div>
              {isTarget && (
                <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded animate-pulse">
                  TAP
                </span>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

function ScreenPickChapter({ onSelect }: { onSelect: () => void }) {
  return (
    <motion.div {...screenMotion} className="absolute inset-0 pt-9 flex flex-col">
      <div className="px-4 pt-3 pb-3 border-b border-foreground/10">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Andy Weir
        </p>
        <p className="font-serif text-[15px] text-foreground leading-tight">
          Project Hail Mary
        </p>
      </div>
      <div className="px-3 py-2 space-y-1 flex-1 overflow-hidden">
        {WALKTHROUGH_CHAPTERS.map((c) => {
          const isTarget = c.n === 7;
          return (
            <button
              key={c.n}
              onClick={isTarget ? onSelect : undefined}
              className={cn(
                "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all",
                isTarget
                  ? "bg-primary/15 ring-1 ring-primary/50 shadow-[0_0_20px_-4px_rgba(242,42,140,0.5)]"
                  : "opacity-60",
              )}
              tabIndex={isTarget ? 0 : -1}
            >
              <span
                className={cn(
                  "text-[10px] w-5 text-right font-mono",
                  isTarget ? "text-primary" : "text-muted-foreground",
                )}
              >
                {c.n}
              </span>
              <span
                className={cn(
                  "text-[12px] flex-1 truncate",
                  isTarget ? "text-foreground font-medium" : "text-foreground/70",
                )}
              >
                {c.title}
              </span>
              {isTarget ? (
                <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded animate-pulse">
                  PAINT
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground/60">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

function ScreenScene({ onTap }: { onTap: () => void }) {
  return (
    <motion.div {...screenMotion} className="absolute inset-0">
      <button
        onClick={onTap}
        className="absolute inset-0 group text-left"
        aria-label="Restart the walkthrough"
      >
        <img
          src={`${BASE}scenes/landing/phm.png`}
          alt="Painted scene from Project Hail Mary, Chapter 7"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute top-10 left-3 right-3 flex items-start justify-between gap-2">
          <div className="bg-background/80 backdrop-blur rounded-md px-2 py-1">
            <p className="text-[9px] uppercase tracking-wider text-primary font-semibold">
              Now reading
            </p>
            <p className="font-serif text-[11px] text-foreground leading-tight">
              PHM · Ch. 7
            </p>
          </div>
          <div className="bg-primary/95 text-primary-foreground rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-lg">
            ✨ Painted
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 pt-12 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
          <p className="text-[10px] uppercase tracking-wider text-primary/90 font-semibold">
            Chapter 7
          </p>
          <p className="font-serif text-sm text-white leading-tight">
            First contact, in the dark.
          </p>
          <p className="text-[10px] text-white/55 mt-1">Tap to start over →</p>
        </div>
      </button>
    </motion.div>
  );
}

function PhoneWalkthrough() {
  const [step, setStep] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [manualPaused, setManualPaused] = useState(false);
  const paused = hoverPaused || manualPaused;
  const resumeTimerRef = useRef<number | null>(null);
  const STEPS = 3;

  useEffect(() => {
    if (paused) return;
    const dur = step === 2 ? 4500 : 3200;
    const t = window.setTimeout(() => setStep((s) => (s + 1) % STEPS), dur);
    return () => window.clearTimeout(t);
  }, [step, paused]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current !== null) {
        window.clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
    };
  }, []);

  const jumpTo = (next: number) => {
    setManualPaused(true);
    setStep(next);
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = window.setTimeout(() => {
      setManualPaused(false);
      resumeTimerRef.current = null;
    }, 800);
  };

  const advance = () => jumpTo((step + 1) % STEPS);

  return (
    <div
      className="relative mx-auto"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocus={() => setHoverPaused(true)}
      onBlur={() => setHoverPaused(false)}
      data-testid="phone-walkthrough"
    >
      <div
        aria-hidden="true"
        className="absolute -inset-12 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(55% 55% at 50% 45%, rgba(242,42,140,0.28), rgba(242,42,140,0.08) 55%, transparent 75%)",
          filter: "blur(10px)",
        }}
      />
      <div className="relative w-[280px] h-[572px] mx-auto rounded-[44px] bg-[#0a0510] p-[10px] ring-2 ring-[hsl(271,30%,18%)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)_inset]">
        <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-24 h-[22px] rounded-b-2xl bg-black z-30" />
        <div className="relative w-full h-full rounded-[34px] overflow-hidden bg-[hsl(271,40%,8%)]">
          <div className="absolute top-0 inset-x-0 h-9 flex items-center justify-between px-5 pt-2 text-[10px] text-foreground/70 font-medium z-20 pointer-events-none">
            <span>9:41</span>
            <span className="opacity-70">100%</span>
          </div>
          <AnimatePresence mode="wait">
            {step === 0 && <ScreenPickBook key="pick" onSelect={advance} />}
            {step === 1 && <ScreenPickChapter key="chap" onSelect={advance} />}
            {step === 2 && <ScreenScene key="scene" onTap={advance} />}
          </AnimatePresence>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-[60%] h-5 pointer-events-none"
        style={{
          background:
            "radial-gradient(50% 100% at 50% 0%, rgba(0,0,0,0.55), transparent 70%)",
          filter: "blur(6px)",
        }}
      />
      <div className="flex justify-center items-center gap-1.5 mt-6">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => jumpTo(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === step
                ? "w-7 bg-primary"
                : "w-1.5 bg-foreground/25 hover:bg-foreground/40",
            )}
            aria-label={`Step ${i + 1}`}
            aria-current={i === step}
          />
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground mt-3 max-w-[280px] mx-auto leading-relaxed">
        {STEP_CAPTIONS[step]}
      </p>
    </div>
  );
}

function ShowcaseCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setCanPrev(el.scrollLeft > 16);
      setCanNext(el.scrollLeft < max - 16);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollByCards = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.querySelector<HTMLElement>("[data-carousel-card]");
    const step = first ? first.offsetWidth + 24 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section className="relative py-16 sm:py-24 bg-gradient-to-b from-background via-[hsl(271,45%,7%)] to-background overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex items-end justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 jtb-eyebrow">
            <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--jtb-spark)" }} />
            <span>Whatever you're reading — here's a taste</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight">
            Recognise any of these?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Real scenes from books people are reading right now, paired with
            the actual recognised title and cover. Drop in your EPUB or search
            for the book, and we carry that identity all the way through:
            recognised title, matched cover, chapter scene, reader resume
            point, bookshelf entry, and review when you finish.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            onClick={() => scrollByCards(-1)}
            disabled={!canPrev}
            data-testid="button-showcase-prev"
            className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center bg-background/50 backdrop-blur text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground/5 hover:border-foreground/20 transition-all"
            aria-label="Previous scenes"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollByCards(1)}
            disabled={!canNext}
            data-testid="button-showcase-next"
            className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center bg-background/50 backdrop-blur text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground/5 hover:border-foreground/20 transition-all"
            aria-label="Next scenes"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Left fade */}
        <div className="absolute left-0 inset-y-0 w-8 md:w-24 bg-gradient-to-r from-[hsl(271,45%,7%)] to-transparent z-10 pointer-events-none" />
        
        <div
          ref={trackRef}
          data-testid="showcase-carousel"
          // scroll-pl-* must mirror pl-* exactly so snap-mandatory aligns the
          // first card at scrollLeft=0. Without this, the browser snaps the
          // first card past its left padding and the prev-arrow logic thinks
          // we've already scrolled.
          className="flex gap-5 sm:gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-10 scroll-smooth pl-4 sm:pl-6 lg:pl-8 pr-4 sm:pr-6 lg:pr-8 scroll-pl-4 sm:scroll-pl-6 lg:scroll-pl-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {SHOWCASE.map((item, i) => (
            <div
              key={item.title}
              data-testid={`showcase-card-${i}`}
              data-carousel-card
              className="relative shrink-0 snap-start snap-always w-[85vw] sm:w-[520px] lg:w-[620px] rounded-[26px] overflow-hidden group ring-1 ring-border/40 hover:ring-primary/30 transition-all"
              style={{ background: item.gradient }}
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={`${BASE}${item.src}`}
                  alt={`Painted scene from ${item.title}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-x-0 top-0 p-4 sm:p-5 flex items-start justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--jtb-spark-hi)] backdrop-blur">
                  <Sparkles className="w-3 h-3" />
                  Recognised title
                </div>
                <div className="relative w-24 sm:w-28 lg:w-32 shrink-0 translate-y-3">
                  <div className="absolute inset-0 rounded-[18px] bg-black/50 blur-md scale-95" />
                  <img
                    src={item.coverSrc}
                    alt={`Cover of ${item.title}`}
                    className="relative aspect-[2/3] w-full rounded-[18px] object-cover ring-1 ring-[var(--jtb-gold-200)]/60 shadow-[0_22px_50px_rgba(0,0,0,0.5)]"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                <p className="text-[10px] uppercase tracking-wider text-primary/90 font-semibold mb-1 pr-28 sm:pr-32">
                  {item.author}
                </p>
                <p className="font-serif text-xl sm:text-2xl text-white leading-tight mb-1 pr-28 sm:pr-32">
                  {item.title}
                </p>
                <p className="text-sm sm:text-base text-white/75 line-clamp-2">
                  {item.caption}
                </p>
                <p className="mt-3 text-[11px] sm:text-xs text-white/80 max-w-[34rem]">
                  {item.proof}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right fade */}
        <div className="absolute right-0 inset-y-0 w-8 md:w-24 bg-gradient-to-l from-[hsl(271,45%,7%)] to-transparent z-10 pointer-events-none" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <p className="text-center text-xs text-muted-foreground/70">
          Examples generated by Jump the Book. Book titles and authors are
          shown for illustration; covers and trademarks belong to their
          respective rights holders.
        </p>
      </div>
    </section>
  );
}

function TryNowSection() {
  const [query, setQuery] = useState("Project Hail Mary");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [preview, setPreview] = useState<TryPreview>({
    kind: "recognized",
    item: SHOWCASE[1],
  });
  const resultsQ = useBookSearch(query);
  const results = resultsQ.data ?? [];
  const isSearching = resultsQ.isLoading || resultsQ.isFetching;

  useEffect(() => {
    if (query.trim().length < 3) return;
    if (results.length === 0) return;
    const selected =
      results.find((result) => result.key === selectedKey) ??
      results.find((result) => !!findShowcaseMatch(result)) ??
      results[0];
    if (!selected) return;
    const match = findShowcaseMatch(selected);
    setPreview(match ? { kind: "recognized", item: match } : { kind: "search", result: selected });
    if (selected.key !== selectedKey) setSelectedKey(selected.key);
  }, [query, results, selectedKey]);

  const handleQuickPick = (title: string) => {
    setQuery(title);
    setSelectedKey(null);
    const match = findShowcaseMatch(title);
    if (match) setPreview({ kind: "recognized", item: match });
  };

  const handleResultSelect = (result: BookSearchResult) => {
    setSelectedKey(result.key);
    const match = findShowcaseMatch(result);
    setPreview(match ? { kind: "recognized", item: match } : { kind: "search", result });
  };

  return (
    <section
      id="try-now"
      className="relative py-16 sm:py-24 bg-gradient-to-b from-background via-[hsl(271,45%,7%)] to-[hsl(271,45%,6%)] scroll-mt-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 jtb-eyebrow bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
            <Search className="w-3.5 h-3.5" />
            <span>Try it now from the homepage</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.08]">
            Search a book. Load a sample scene.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-3xl">
            This is the honest version: public search is live, and recognised
            titles can load an instant painted preview right here. Full
            chapter-by-chapter generation still starts after signup.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] items-start">
          <div className="rounded-[28px] border border-border/50 bg-[rgba(255,255,255,0.03)] p-5 sm:p-6 shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
            <div className="space-y-4">
              <label htmlFor="home-book-search" className="text-sm font-medium text-foreground">
                Search by title or author
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="home-book-search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.currentTarget.value);
                    setSelectedKey(null);
                  }}
                  placeholder="e.g. Red Rising or Project Hail Mary"
                  autoComplete="off"
                  className="w-full h-14 rounded-2xl border border-border/60 bg-background/60 pl-11 pr-11 text-base text-foreground placeholder:text-muted-foreground/70 outline-none ring-0 transition-colors focus:border-primary/50"
                />
                {isSearching && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_PICKS.map((title) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => handleQuickPick(title)}
                    className="inline-flex items-center rounded-full border border-border/50 bg-background/40 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                  >
                    {title}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/80">
                Desktop web works today. iPhone and Android apps are coming
                soon, but you don’t need to wait for the app stores.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {query.trim().length < 3 ? (
                <div className="rounded-2xl border border-dashed border-border/50 px-4 py-6 text-sm text-muted-foreground">
                  Type a title and we’ll pull live book matches here.
                </div>
              ) : results.length > 0 ? (
                results.slice(0, 5).map((result) => {
                  const match = findShowcaseMatch(result);
                  const active =
                    preview.kind === "recognized"
                      ? match?.title === preview.item.title
                      : preview.kind === "search" && preview.result.key === result.key;
                  return (
                    <button
                      key={result.key}
                      type="button"
                      onClick={() => handleResultSelect(result)}
                      className={cn(
                        "w-full text-left rounded-2xl border p-3 transition-all",
                        active
                          ? "border-primary/50 bg-primary/10"
                          : "border-border/40 bg-background/30 hover:border-primary/30",
                      )}
                    >
                      <div className="flex gap-3">
                        <div className="w-14 h-20 rounded-xl overflow-hidden bg-muted shrink-0 ring-1 ring-border/40">
                          {result.coverUrl ? (
                            <img
                              src={result.coverUrl}
                              alt=""
                              aria-hidden="true"
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[hsl(271,28%,16%)] to-[hsl(271,28%,24%)]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-serif text-base leading-tight text-foreground line-clamp-2">
                              {result.title}
                            </p>
                            {match && (
                              <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                                Preview ready
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                            {result.author}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground/75">
                            {match
                              ? "Load the recognised cover and painted sample scene now."
                              : "Book found. Sign up to paint your exact chapter."}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : !isSearching ? (
                <div className="rounded-2xl border border-dashed border-border/50 px-4 py-6 text-sm text-muted-foreground">
                  No matches yet. Try the title or the author’s surname.
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-[30px] overflow-hidden ring-1 ring-border/40 bg-[hsl(271,32%,8%)] shadow-[0_20px_70px_rgba(0,0,0,0.26)]">
            {preview.kind === "recognized" ? (
              <div
                className="relative min-h-[520px] sm:min-h-[580px]"
                style={{ background: preview.item.gradient }}
              >
                <img
                  src={`${BASE}${preview.item.src}`}
                  alt={`Painted preview from ${preview.item.title}`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
                <div className="absolute top-5 left-5 right-5 flex items-start justify-between gap-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--jtb-spark-hi)] backdrop-blur">
                    <Sparkles className="w-3 h-3" />
                    Instant preview
                  </div>
                  <img
                    src={preview.item.coverSrc}
                    alt={`Cover of ${preview.item.title}`}
                    className="w-28 sm:w-32 rounded-[18px] ring-1 ring-[var(--jtb-gold-200)]/65 shadow-[0_24px_50px_rgba(0,0,0,0.45)]"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 space-y-4">
                  <div className="space-y-2 max-w-2xl">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-primary/90 font-semibold">
                      {preview.item.author}
                    </p>
                    <h3 className="font-serif text-3xl sm:text-4xl leading-[1.08] text-white">
                      {preview.item.title}
                    </h3>
                    <p className="text-base text-white/80 max-w-xl">
                      {preview.item.caption}
                    </p>
                    <p className="text-sm text-white/72 max-w-xl">
                      {preview.item.proof}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/sign-up"
                      className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[12px] bg-primary text-primary-foreground border border-[rgba(255,122,194,0.45)] font-semibold text-sm hover:brightness-110 transition-[filter] shadow-[0_6px_28px_rgba(242,42,140,0.42)]"
                    >
                      Paint my chapter next
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                      href="#section-bookshelf"
                      className="inline-flex items-center justify-center h-12 px-6 rounded-[12px] bg-white/5 text-white border border-white/10 font-semibold text-sm hover:bg-white/10 transition-colors"
                    >
                      See the rest of the product
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="min-h-[520px] sm:min-h-[580px] p-6 sm:p-8 flex flex-col justify-between bg-[radial-gradient(circle_at_top,rgba(216,27,122,0.16),transparent_50%),linear-gradient(180deg,hsl(271,35%,10%),hsl(271,40%,7%))]">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-semibold text-primary">
                  <Search className="w-3 h-3" />
                  Book found
                </div>
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  <div className="w-40 rounded-[20px] overflow-hidden ring-1 ring-border/40 shadow-[0_24px_50px_rgba(0,0,0,0.35)]">
                    {preview.result.coverUrl ? (
                      <img
                        src={preview.result.coverUrlLarge ?? preview.result.coverUrl}
                        alt={`Cover of ${preview.result.title}`}
                        className="w-full aspect-[2/3] object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full aspect-[2/3] bg-gradient-to-br from-[hsl(271,24%,18%)] to-[hsl(271,28%,28%)]" />
                    )}
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-primary/90 font-semibold">
                      {preview.result.author}
                    </p>
                    <h3 className="font-serif text-3xl sm:text-4xl leading-[1.08] text-white">
                      {preview.result.title}
                    </h3>
                    <p className="text-base text-white/75 max-w-xl">
                      We can already recognise this title and carry its cover
                      into your shelf. Full chapter painting starts once you
                      sign in and tell us where you are in the book.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Link
                        href="/sign-up"
                        className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[12px] bg-primary text-primary-foreground border border-[rgba(255,122,194,0.45)] font-semibold text-sm hover:brightness-110 transition-[filter] shadow-[0_6px_28px_rgba(242,42,140,0.42)]"
                      >
                        Generate this after signup
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleQuickPick("Project Hail Mary")}
                        className="inline-flex items-center justify-center h-12 px-6 rounded-[12px] bg-white/5 text-white border border-white/10 font-semibold text-sm hover:bg-white/10 transition-colors"
                      >
                        Load a recognised preview
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-white/55">
                  Instant scene previews are currently available for recognised
                  titles on this page. Full on-demand generation stays
                  spoiler-safe behind your account.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground selection:bg-primary/30 pb-16 lg:pb-0 relative overflow-x-hidden">
      <ScrollBunny />
      
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-gradient-to-b from-background via-background/80 to-transparent pb-4 pt-4 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#E6C885] to-[#8E7339] p-[1px] shadow-[0_0_15px_rgba(230,200,133,0.3)] transition-transform group-hover:scale-105 group-focus-visible:ring-2 ring-primary ring-offset-2 ring-offset-background">
              <div className="w-full h-full bg-[#08080B] rounded-[3px] flex items-center justify-center">
                <img
                  src={`${BASE}logo-mark.svg`}
                  alt=""
                  className="w-5 h-5"
                />
              </div>
            </div>
            <span className="font-serif text-xl tracking-tight text-foreground font-medium group-hover:text-primary transition-colors">
              Jump the Book
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex h-9 items-center rounded-md px-4 bg-[rgba(255,255,255,0.06)] text-sm font-medium hover:bg-[rgba(255,255,255,0.1)] transition-colors border border-border/50"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative pt-6 sm:pt-12 pb-20 sm:pb-32 px-4 sm:px-6">
        {/* Soft background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(242,42,140,0.15),transparent_70%)] pointer-events-none -z-10" />
        
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-6 lg:max-w-[600px] text-center lg:text-left z-10"
          >
            <div className="inline-flex items-center justify-center lg:justify-start gap-2 jtb-eyebrow bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>See the book you're reading</span>
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-foreground">
              The chapter you're on,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--jtb-gold-200)] to-[var(--jtb-spark)]">
                painted.
              </span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-[560px] mx-auto lg:mx-0 leading-relaxed">
              Tell Jump the Book what you're reading and what chapter you're
              on. We paint the scene — like a movie still, made just for that
              moment. Spoiler-free. Nothing from later in the book leaks in.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[10px] bg-primary text-primary-foreground border border-[rgba(255,122,194,0.45)] font-semibold text-sm hover:brightness-110 transition-[filter] shadow-[0_6px_28px_rgba(242,42,140,0.42)]"
                data-testid="link-paint-my-book"
              >
                <Upload className="w-4 h-4" />
                Paint a scene from my book
              </Link>
              <a
                href="#try-now"
                className="inline-flex items-center justify-center h-12 px-6 rounded-[10px] bg-transparent text-[var(--jtb-accent-hi)] border border-[var(--jtb-border-hi)] font-semibold text-sm hover:bg-[rgba(201,169,106,0.06)] hover:border-primary transition-colors"
                data-testid="link-try-now"
              >
                Try it now
              </a>
            </div>
            <p className="text-xs text-muted-foreground/70 pt-1">
              Use it in your browser today on desktop or mobile. App Store
              and Google Play builds are coming soon.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="relative mx-auto lg:mx-0 z-10"
          >
            <PhoneWalkthrough />
          </motion.div>
        </div>
      </section>

      {/* ── Try it now ─────────────────────────────────────────────────────── */}
      <TryNowSection />

      {/* ── Showcase gallery ────────────────────────────────────────────────── */}
      <ShowcaseCarousel />

      {/* ── Bookshelf, one place ───────────────────────────────────────────── */}
      <BookshelfShowcase />

      {/* ── Cross-device product showcase ─────────────────────────────────── */}
      <CrossDeviceShowcase />

      {/* ── Closing CTA ───────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-background to-[hsl(271,45%,8%)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-32 text-center space-y-6">
          <h2 className="font-serif text-4xl sm:text-5xl tracking-tight">
            See your next chapter.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            The fastest way to get it is to see it. Drop in your EPUB and
            paint the chapter you're on — or step into a classic with no
            signup at all.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-6">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl bg-primary text-primary-foreground border border-[rgba(255,122,194,0.45)] font-semibold text-base hover:brightness-110 transition-[filter] shadow-[0_6px_28px_rgba(242,42,140,0.42)]"
              data-testid="link-paint-my-book-bottom"
            >
              <Upload className="w-5 h-5" />
              Paint a scene from my book
            </Link>
            <a
              href="#try-now"
              className="inline-flex items-center justify-center h-14 px-8 rounded-xl bg-transparent text-[var(--jtb-accent-hi)] border border-[var(--jtb-border-hi)] font-semibold text-base hover:bg-[rgba(201,169,106,0.06)] hover:border-primary transition-colors"
              data-testid="link-try-now-bottom"
            >
              Try it now
            </a>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center jtb-label opacity-70 bg-[hsl(271,45%,8%)]">
        Reading is for readers.
      </footer>
    </div>
  );
}

/**
 * BookshelfShowcase: marketing section that surfaces the existing /library and
 * /now-reading features on the landing page so visitors understand JTB is a
 * full reading companion, not just a one-shot scene generator.
 *
 * No new backend — this is a static visual mock that mirrors the real shelf UI
 * (status tabs, search, progress bars, scene counts, format tags, series pills)
 * paired with a feature list. Keep mock data in sync with what the real app can
 * actually do; do not promise capabilities that aren't shipped.
 */
const SHELF_MOCK = [
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    src: "scenes/landing/phm.png",
    status: "reading" as const,
    progress: 64,
    chapter: 18,
    scenes: 12,
    format: "Ebook" as const,
  },
  {
    title: "The Way of Kings",
    author: "Brandon Sanderson",
    src: "scenes/landing/stormlight.png",
    status: "reading" as const,
    progress: 8,
    chapter: 4,
    scenes: 1,
    format: "Audiobook" as const,
    seriesName: "Stormlight",
    seriesOrder: 1,
  },
  {
    title: "Dungeon Crawler Carl",
    author: "Matt Dinniman",
    src: "scenes/landing/dcc.png",
    status: "reading" as const,
    progress: 22,
    chapter: 6,
    scenes: 4,
    format: "Ebook" as const,
    seriesName: "DCC",
    seriesOrder: 1,
  },
  {
    title: "A Court of Thorns and Roses",
    author: "Sarah J. Maas",
    src: "scenes/landing/acotar.png",
    status: "finished" as const,
    progress: 100,
    chapter: 39,
    scenes: 18,
    format: "Paperback" as const,
    seriesName: "ACOTAR",
    seriesOrder: 1,
  },
];

const SHELF_TABS = [
  { key: "all", label: "All", count: 14 },
  { key: "reading", label: "Reading", count: 3 },
  { key: "want", label: "Want to read", count: 7 },
  { key: "finished", label: "Finished", count: 4 },
] as const;

function FormatTag({ format }: { format: "Paperback" | "Ebook" | "Audiobook" }) {
  const Icon =
    format === "Audiobook" ? Headphones : format === "Ebook" ? Tablet : BookOpen;
  return (
    <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-semibold text-muted-foreground/80 bg-foreground/5 px-1.5 py-0.5 rounded">
      <Icon className="w-2.5 h-2.5" />
      {format}
    </span>
  );
}

function ShelfBookRow({ book }: { book: (typeof SHELF_MOCK)[number] }) {
  return (
    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-foreground/5 ring-1 ring-foreground/10">
      <img
        src={`${BASE}${book.src}`}
        alt=""
        aria-hidden="true"
        className="w-12 h-14 rounded-md object-cover flex-shrink-0"
        loading="lazy"
      />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-1.5">
          <p className="text-[9px] uppercase tracking-wide text-muted-foreground truncate">
            {book.author}
          </p>
          {book.seriesName && (
            <span className="text-[8px] font-mono text-primary/80 bg-primary/10 px-1 rounded">
              {book.seriesName} #{book.seriesOrder}
            </span>
          )}
        </div>
        <p className="font-serif text-[12px] leading-tight text-foreground truncate">
          {book.title}
        </p>
        <div className="flex items-center gap-2">
          <FormatTag format={book.format} />
          {book.status === "finished" ? (
            <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-semibold text-[var(--jtb-gold-200)]">
              <CheckCheck className="w-2.5 h-2.5" />
              Finished
            </span>
          ) : (
            <span className="text-[9px] text-muted-foreground/80">
              Ch {book.chapter} · {book.scenes} {book.scenes === 1 ? "scene" : "scenes"}
            </span>
          )}
        </div>
        {book.status !== "finished" && (
          <div className="h-1 w-full rounded-full bg-foreground/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-[var(--jtb-spark-hi)]"
              style={{ width: `${book.progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function BookshelfPhone() {
  return (
    <div className="relative mx-auto" data-testid="bookshelf-mockup">
      <div
        aria-hidden="true"
        className="absolute -inset-12 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(55% 55% at 50% 45%, rgba(242,42,140,0.22), rgba(242,42,140,0.06) 55%, transparent 75%)",
          filter: "blur(10px)",
        }}
      />
      <div className="relative w-[280px] h-[572px] mx-auto rounded-[44px] bg-[#0a0510] p-[10px] ring-2 ring-[hsl(271,30%,18%)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)_inset]">
        <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-24 h-[22px] rounded-b-2xl bg-black z-30" />
        <div className="relative w-full h-full rounded-[34px] overflow-hidden bg-[hsl(271,40%,8%)]">
          <div className="absolute top-0 inset-x-0 h-9 flex items-center justify-between px-5 pt-2 text-[10px] text-foreground/70 font-medium z-20 pointer-events-none">
            <span>9:41</span>
            <span className="opacity-70">100%</span>
          </div>
          <div className="absolute inset-0 pt-9 flex flex-col">
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
              <p className="font-serif text-[15px] text-foreground">Bookshelf</p>
              <div className="w-7 h-7 rounded-full bg-primary/30 ring-1 ring-primary/40" />
            </div>
            <div className="px-3 pb-2">
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-foreground/5 ring-1 ring-foreground/10">
                <Search className="w-3 h-3 text-muted-foreground/70" />
                <span className="text-[10px] text-muted-foreground/70">
                  Search 14 books
                </span>
              </div>
            </div>
            <div className="px-3 pb-2 flex items-center gap-1 overflow-x-auto no-scrollbar">
              {SHELF_TABS.map((t) => {
                const active = t.key === "reading";
                return (
                  <span
                    key={t.key}
                    className={cn(
                      "shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all",
                      active
                        ? "bg-primary/15 text-primary ring-1 ring-primary/40"
                        : "text-muted-foreground/80",
                    )}
                  >
                    {t.label}
                    <span
                      className={cn(
                        "text-[9px] font-mono",
                        active ? "text-primary/80" : "text-muted-foreground/60",
                      )}
                    >
                      {t.count}
                    </span>
                  </span>
                );
              })}
            </div>
            <div className="px-3 pb-3 space-y-2 flex-1 overflow-hidden">
              {SHELF_MOCK.map((b) => (
                <ShelfBookRow key={b.title} book={b} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-[60%] h-5 pointer-events-none"
        style={{
          background:
            "radial-gradient(50% 100% at 50% 0%, rgba(0,0,0,0.55), transparent 70%)",
          filter: "blur(6px)",
        }}
      />
    </div>
  );
}

function BookshelfShowcase() {
  return (
    <section
      id="section-bookshelf"
      data-testid="section-bookshelf"
      className="relative py-20 sm:py-28 bg-gradient-to-b from-[hsl(271,45%,7%)] via-background to-[hsl(271,45%,6%)]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[auto_1fr] gap-12 lg:gap-16 items-center">
          {/*
            Source order = mobile order. Phone mockup first so the visual hook
            lands before the bullet wall on Android Chrome. On lg+ the grid
            naturally places the phone in column 1 (left) and the text in column 2.
          */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <BookshelfPhone />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="space-y-8 text-center lg:text-left"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 jtb-eyebrow bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                <Layers className="w-3.5 h-3.5" />
                <span>Every book you're on, in one place</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.1]">
                Your bookshelf,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--jtb-gold-200)] to-[var(--jtb-spark)]">
                  smarter.
                </span>
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-[520px] mx-auto lg:mx-0">
                Status tabs that actually mean something. Series-aware sort so
                the next one's always queued. Search every title and author in
                a tap. And a Now Reading page that picks up exactly where you
                left off — chapter, scene and all.
              </p>
            </div>

            <ul className="space-y-4 text-left max-w-[520px] mx-auto lg:mx-0">
              <ShelfFeatureBullet
                icon={<CheckCheck className="w-4 h-4" />}
                title="Status that means something"
                body="Reading, Want to read, Finished. Auto-graduates when you hit 100%, so your shelf is honest without you babysitting it."
              />
              <ShelfFeatureBullet
                icon={<Layers className="w-4 h-4" />}
                title="Series-aware sort"
                body="Stormlight #1, ACOTAR #1, DCC #1 — sorted in series order so the next one's queued and standalones don't get buried."
              />
              <ShelfFeatureBullet
                icon={<Search className="w-4 h-4" />}
                title="Search the whole shelf"
                body="Title, author, series — type three letters and your library narrows. Works across Reading, Want to read and Finished at once."
              />
              <ShelfFeatureBullet
                icon={<BookOpen className="w-4 h-4" />}
                title="Picks up where you left off"
                body="Now Reading shows progress, the latest scene you painted, and a Continue button that drops you back into chapter and verse."
              />
            </ul>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 justify-center lg:justify-start">
              <Link
                href="/sign-up"
                data-testid="link-bookshelf-signup"
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[10px] bg-primary text-primary-foreground border border-[rgba(255,122,194,0.45)] font-semibold text-sm hover:brightness-110 transition-[filter] shadow-[0_6px_28px_rgba(242,42,140,0.42)]"
              >
                Build my shelf
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-xs text-muted-foreground/70 self-center">
                Free. No credit card. Your books stay yours.
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function DesktopWorkspaceMock() {
  return (
    <div className="relative" data-testid="desktop-workspace-mock">
      <div
        aria-hidden="true"
        className="absolute -inset-10 -z-10"
        style={{
          background:
            "radial-gradient(55% 55% at 50% 35%, rgba(242,42,140,0.18), rgba(242,42,140,0.04) 58%, transparent 78%)",
          filter: "blur(12px)",
        }}
      />
      <div className="rounded-[28px] border border-border/60 bg-[hsl(271,32%,8%)] shadow-[0_28px_90px_rgba(0,0,0,0.34)] overflow-hidden">
        <div className="h-11 border-b border-border/50 bg-[rgba(255,255,255,0.03)] px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[rgba(255,255,255,0.18)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[rgba(255,255,255,0.14)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[rgba(255,255,255,0.10)]" />
          </div>
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <Monitor className="w-3.5 h-3.5" />
            Desktop web
          </div>
        </div>
        <div className="grid md:grid-cols-[260px_1fr] min-h-[440px]">
          <div className="border-r border-border/50 bg-[rgba(255,255,255,0.025)] p-4 space-y-3">
            <div className="rounded-xl border border-border/40 bg-background/40 px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Search className="w-3.5 h-3.5" />
              Search your shelf
            </div>
            <div className="space-y-2">
              {SHELF_MOCK.map((book) => (
                <ShelfBookRow key={`desktop-${book.title}`} book={book} />
              ))}
            </div>
          </div>
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary/90 font-semibold">
                  Now reading
                </p>
                <h3 className="font-serif text-2xl text-foreground">
                  Project Hail Mary
                </h3>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-primary font-semibold">
                <MessageSquareText className="w-3 h-3" />
                Review prompt ready
              </div>
            </div>
            <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-4">
              <div className="relative rounded-[24px] overflow-hidden ring-1 ring-border/40 min-h-[290px]">
                <img
                  src={`${BASE}scenes/landing/phm.png`}
                  alt="Project Hail Mary desktop preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute top-4 right-4 w-24 rounded-[16px] overflow-hidden ring-1 ring-[var(--jtb-gold-200)]/65 shadow-[0_20px_45px_rgba(0,0,0,0.42)]">
                  <img
                    src="https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg"
                    alt="Project Hail Mary cover"
                    className="w-full aspect-[2/3] object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4 space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-primary/90 font-semibold">
                    Chapter 7
                  </p>
                  <p className="font-serif text-xl text-white">
                    First contact, in the dark.
                  </p>
                  <p className="text-sm text-white/75">
                    Reader, shelf, cover, and painted scene all stay connected.
                  </p>
                </div>
              </div>
              <div className="rounded-[24px] border border-border/40 bg-[rgba(255,255,255,0.03)] p-4 space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-primary/90 font-semibold">
                    Finish the book
                  </p>
                  <h4 className="font-serif text-xl text-foreground">
                    Rate it, then keep it on your shelf.
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--jtb-gold-200)]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Sparkles key={i} className="w-4 h-4" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Reviews are private unless you share them. Resume reading on
                  desktop, keep going on your phone, and the latest progress is
                  still there.
                </p>
                <div className="rounded-2xl border border-primary/15 bg-primary/10 px-4 py-3 text-sm text-primary/90">
                  Web app live now. App Store and Google Play are next.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CrossDeviceShowcase() {
  return (
    <section className="relative py-16 sm:py-24 bg-gradient-to-b from-[hsl(271,45%,6%)] via-background to-[hsl(271,45%,7%)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 jtb-eyebrow bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
            <Monitor className="w-3.5 h-3.5" />
            <span>Built for desktop and phone</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.08]">
            Read on your laptop. Pick up on your phone.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-3xl">
            Jump the Book isn’t just a mobile mockup. The web app is the
            product today, and it already covers the moments that matter:
            search, reading, scene generation, ratings, imports, and your
            shelf. Native apps are coming next.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] items-center">
          <DesktopWorkspaceMock />
          <div className="flex flex-col gap-6">
            <div className="mx-auto xl:mx-0">
              <BookshelfPhone />
            </div>
            <div className="rounded-[26px] border border-border/50 bg-[rgba(255,255,255,0.03)] p-5 sm:p-6 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-primary font-semibold">
                <Smartphone className="w-3 h-3" />
                App stores coming soon
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The mobile experience matters, but we’re not pretending that’s
                the only place readers live. Start in the browser now. When the
                native apps land, the same shelf and scenes come with you.
              </p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6">
          {STORY_FEATURES.map((feature, index) => (
            <Feature
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              body={feature.body}
              delay={index * 0.05}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ShelfFeatureBullet({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mt-0.5">
        {icon}
      </div>
      <div className="space-y-0.5">
        <h3 className="font-serif text-base sm:text-lg text-foreground leading-tight">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
      </div>
    </li>
  );
}

function Feature({
  icon,
  title,
  body,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  delay?: number;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="h-full rounded-2xl border border-border/50 bg-[rgba(255,255,255,0.03)] p-5 sm:p-6 space-y-4 shadow-[0_12px_40px_rgba(0,0,0,0.16)]"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-[0_0_20px_rgba(242,42,140,0.15)]">
        {icon}
      </div>
      <h3 className="font-serif text-xl sm:text-2xl tracking-tight text-foreground">{title}</h3>
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{body}</p>
    </motion.div>
  );
}
