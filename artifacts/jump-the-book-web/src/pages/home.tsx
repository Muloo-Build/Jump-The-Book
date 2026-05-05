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
  Play,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface DemoBook {
  id: string;
  title: string;
  author: string;
  hook: string;
  thumbnail: string;
  gradient: string;
  badge: string;
}

const DEMOS: DemoBook[] = [
  {
    id: "alice",
    title: "Alice in Wonderland",
    author: "Lewis Carroll",
    hook: "Down the rabbit hole, in six painted scenes.",
    thumbnail: "scenes/alice-ch1-s3.png",
    gradient: "linear-gradient(135deg, #1a0a3a, #3a1a6a, #8b5cf6)",
    badge: "Whimsical",
  },
  {
    id: "dracula",
    title: "Dracula",
    author: "Bram Stoker",
    hook: "A coach into the Carpathians. Nobody comes back.",
    thumbnail: "scenes/dracula-ch1-s2.png",
    gradient: "linear-gradient(135deg, #1a0a0a, #3a0a0a, #8b0000)",
    badge: "Gothic",
  },
  {
    id: "frankenstein",
    title: "Frankenstein",
    author: "Mary Shelley",
    hook: "A storm. A laboratory. Something opens its eyes.",
    thumbnail: "scenes/frank-ch1-s2.png",
    gradient: "linear-gradient(135deg, #0a1a0a, #1a3a1a, #2a6a2a)",
    badge: "Horror",
  },
  {
    id: "sherlock",
    title: "Sherlock Holmes",
    author: "Arthur Conan Doyle",
    hook: "Baker Street, gaslight, and a client in disguise.",
    thumbnail: "scenes/sherlock-ch1-s1.png",
    gradient: "linear-gradient(135deg, #1a1208, #3a2808, #c9974a)",
    badge: "Mystery",
  },
];

interface Showcase {
  src: string;
  title: string;
  author: string;
  caption: string;
  gradient: string;
}

const SHOWCASE: Showcase[] = [
  {
    src: "scenes/landing/dcc.png",
    title: "Dungeon Crawler Carl",
    author: "Matt Dinniman",
    caption: "Floor 1, the stairs down.",
    gradient: "linear-gradient(135deg, #1a0a1f, #4a0a3a, #8a1f6a)",
  },
  {
    src: "scenes/landing/phm.png",
    title: "Project Hail Mary",
    author: "Andy Weir",
    caption: "First contact, in the dark.",
    gradient: "linear-gradient(135deg, #06121f, #0a2440, #2a4a7a)",
  },
  {
    src: "scenes/landing/fourthwing.png",
    title: "Fourth Wing",
    author: "Rebecca Yarros",
    caption: "On the parapet at Basgiath.",
    gradient: "linear-gradient(135deg, #0a0612, #2a0a3a, #4a1a6a)",
  },
  {
    src: "scenes/landing/stormlight.png",
    title: "The Way of Kings",
    author: "Brandon Sanderson",
    caption: "A highstorm on the Shattered Plains.",
    gradient: "linear-gradient(135deg, #0a0a1a, #1a1a3a, #3a3a7a)",
  },
  {
    src: "scenes/landing/acotar.png",
    title: "A Court of Thorns and Roses",
    author: "Sarah J. Maas",
    caption: "The Spring Court, by moonlight.",
    gradient: "linear-gradient(135deg, #0a1a0e, #1a3a2a, #4a6a4a)",
  },
  {
    src: "scenes/landing/dune.png",
    title: "Dune",
    author: "Frank Herbert",
    caption: "A worm crests the dune.",
    gradient: "linear-gradient(135deg, #1a0a04, #4a1a08, #8a4a1a)",
  },
  {
    src: "scenes/landing/mistborn.png",
    title: "Mistborn: The Final Empire",
    author: "Brandon Sanderson",
    caption: "Mist over Luthadel.",
    gradient: "linear-gradient(135deg, #1a0a08, #3a0a08, #6a1a18)",
  },
  {
    src: "scenes/landing/nameofthewind.png",
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    caption: "Silence at the Waystone Inn.",
    gradient: "linear-gradient(135deg, #0a0608, #2a1408, #4a2a18)",
  },
];

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
            Real scenes from books people are reading right now — Sanderson,
            Yarros, Maas, Weir, Rothfuss, Herbert, and more. Drop in your
            EPUB and we'll do the same for the chapter you're on, in the
            visual style you pick. Characters stay consistent across
            chapters so a face you saw on page 40 still looks like the same
            person on page 400.
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
              className="relative shrink-0 snap-start snap-always w-[78vw] sm:w-[420px] lg:w-[480px] rounded-2xl overflow-hidden group ring-1 ring-border/40 hover:ring-primary/30 transition-all"
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
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black via-black/80 to-transparent">
                <p className="text-[10px] uppercase tracking-wider text-primary/90 font-semibold mb-1">
                  {item.author}
                </p>
                <p className="font-serif text-lg sm:text-xl text-white leading-tight mb-1">
                  {item.title}
                </p>
                <p className="text-sm text-white/70 line-clamp-2">
                  {item.caption}
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
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="h-9 px-4 rounded-md bg-[rgba(255,255,255,0.06)] text-sm font-medium hover:bg-[rgba(255,255,255,0.1)] transition-colors border border-border/50"
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
                href="#classics"
                className="inline-flex items-center justify-center h-12 px-6 rounded-[10px] bg-transparent text-[var(--jtb-accent-hi)] border border-[var(--jtb-border-hi)] font-semibold text-sm hover:bg-[rgba(201,169,106,0.06)] hover:border-primary transition-colors"
                data-testid="link-try-classic"
              >
                Try it on a classic
              </a>
            </div>
            <p className="text-xs text-muted-foreground/70 pt-1">
              Drop in your EPUB — about 30 seconds. Or step into Alice,
              Dracula, Frankenstein, or Sherlock with no signup at all.
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

      {/* ── Showcase gallery ────────────────────────────────────────────────── */}
      <ShowcaseCarousel />

      {/* ── Classics demo picker ────────────────────────────────────────────── */}
      <section
        id="classics"
        className="relative bg-gradient-to-b from-background to-[hsl(271,45%,6%)] scroll-mt-16 py-16 sm:py-24"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="space-y-4 max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 jtb-eyebrow">
              <Play className="w-3.5 h-3.5" style={{ color: "var(--jtb-spark)" }} />
              <span>No book on you? Step into a classic.</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl tracking-tight">
              Four classics, fully painted, no signup.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For modern books we need your EPUB — about thirty seconds.
              These four are public domain, so we've pre-painted them and
              you can step in right now. Tap a cover to drop into the
              cinematic reader.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {DEMOS.map((demo, i) => (
              <motion.div
                key={demo.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.05, ease: "easeOut" }}
              >
                <Link
                  href={`/experience/${demo.id}?chapter=1`}
                  data-testid={`link-demo-${demo.id}`}
                  className="group relative block overflow-hidden rounded-xl ring-1 ring-border/60 transition-all hover:-translate-y-1"
                  style={{
                    background: demo.gradient,
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    e.currentTarget.style.boxShadow = "var(--jtb-glow-spark)";
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    e.currentTarget.style.boxShadow = "";
                  }}
                  aria-label={`Try the ${demo.title} demo`}
                >
                  <div className="aspect-[3/4] sm:aspect-[4/5] overflow-hidden">
                    <img
                      src={`${BASE}${demo.thumbnail}`}
                      alt=""
                      aria-hidden="true"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <span
                    className="absolute top-3 left-3 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded bg-black/65 backdrop-blur"
                    style={{
                      color: "var(--jtb-spark-hi)",
                      border: "1px solid var(--jtb-spark-soft)",
                    }}
                  >
                    {demo.badge}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
                    <p className="text-[10px] uppercase tracking-wider text-primary/90 font-semibold">
                      {demo.author}
                    </p>
                    <p className="font-serif text-base sm:text-lg leading-tight text-white">
                      {demo.title}
                    </p>
                    <p className="text-xs text-white/70 mt-1 leading-snug line-clamp-2">
                      {demo.hook}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                      Step in
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Three-up: spoiler-safe / styles / context ─────────────────────── */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-b from-[hsl(271,45%,6%)] to-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-12">
            <Feature
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Spoiler-safe by default"
              body="Tell us the chapter you're on. We'll never paint anything that hasn't happened yet — no betrayals, no twists, no dying characters before their time."
            />
            <Feature
              icon={<ImageIcon className="w-6 h-6" />}
              title="Six visual styles"
              body="Comic, watercolour, dark cinematic, manga, painterly fantasy, animated storybook. Pick a vibe per book and the whole library inherits the look."
            />
            <Feature
              icon={<BookOpen className="w-6 h-6" />}
              title="Drop in EPUB or just the title"
              body="Upload your EPUB for chapter-perfect scenes, or sign in and let the open-library lookup ground the art in real characters and places — even without the file."
            />
          </div>
        </div>
      </section>

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
              href="#classics"
              className="inline-flex items-center justify-center h-14 px-8 rounded-xl bg-transparent text-[var(--jtb-accent-hi)] border border-[var(--jtb-border-hi)] font-semibold text-base hover:bg-[rgba(201,169,106,0.06)] hover:border-primary transition-colors"
              data-testid="link-try-classic-bottom"
            >
              Try it on a classic
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

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-4"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-[0_0_20px_rgba(242,42,140,0.15)]">
        {icon}
      </div>
      <h3 className="font-serif text-2xl tracking-tight text-foreground">{title}</h3>
      <p className="text-base text-muted-foreground leading-relaxed">{body}</p>
    </motion.div>
  );
}
