import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  ImageIcon,
  ShieldCheck,
  ArrowRight,
  Play,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Geometric bunny-hop motif. A dotted parabolic arc with a tiny block-built
 * bunny silhouette at the apex, matching the brand mark's rectangular ears
 * + circular head grammar. Used as a between-section divider, under the H1,
 * and as a quiet personality accent throughout the page.
 *
 * The arc is drawn as 9 circles whose radius peaks at the apex and tapers
 * out at both ends, suggesting motion without animating (animation is
 * available via the `animate` prop for spots that warrant attention).
 *
 * Colour comes from --jtb-spark (magenta) so this is also the place the
 * new secondary accent lives most visibly.
 */
function BunnyHop({
  width = 280,
  className = "",
  animate = false,
  ariaHidden = true,
}: {
  width?: number;
  className?: string;
  animate?: boolean;
  ariaHidden?: boolean;
}) {
  // 9 dots traced along a parabola y = -4*(x-0.5)^2 + 1, scaled.
  const dots = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8;
    const x = t;
    const y = 1 - 4 * (t - 0.5) * (t - 0.5); // 0 → 1 → 0
    // Radius grows toward the apex so the trail "lifts".
    const r = 1.2 + y * 2.4;
    // Opacity tapers at the ends so the trail fades in/out.
    const o = 0.35 + y * 0.6;
    return { x, y, r, o };
  });
  const W = 100;
  const H = 34;
  // Horizontal padding inside the viewBox so the leftmost dot AND the
  // bunny silhouette at the landing-end get breathing room and never get
  // clipped by the SVG bounds (or by a parent with negative margin).
  // The arc spans x = PAD .. (W - PAD) instead of 0 .. W.
  const PAD_X = 8;
  const ARC_W = W - PAD_X * 2;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={width}
      height={(width * H) / W}
      className={className}
      aria-hidden={ariaHidden}
      role={ariaHidden ? undefined : "img"}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Trailing dotted hop arc */}
      <g fill="var(--jtb-spark)">
        {dots.slice(0, 8).map((d, i) => (
          <circle
            key={i}
            cx={PAD_X + d.x * ARC_W}
            cy={H - 6 - d.y * (H - 12)}
            r={d.r}
            opacity={d.o}
          >
            {animate && (
              <animate
                attributeName="opacity"
                values={`${d.o};${Math.min(1, d.o + 0.3)};${d.o}`}
                dur="2.4s"
                begin={`${i * 0.12}s`}
                repeatCount="indefinite"
              />
            )}
          </circle>
        ))}
      </g>
      {/* Bunny silhouette at the landing end — geometric, matches the brand mark */}
      <g transform={`translate(${PAD_X + dots[8].x * ARC_W - 6}, ${H - 6 - dots[8].y * (H - 12) - 14})`}>
        {/* Ears — two slim rounded rectangles, slightly splayed */}
        <rect x="0.6" y="0" width="2.4" height="9" rx="1.2" fill="var(--jtb-gold-200, #E6C885)" transform="rotate(-12 1.8 4.5)" />
        <rect x="9" y="0" width="2.4" height="9" rx="1.2" fill="var(--jtb-gold-200, #E6C885)" transform="rotate(12 10.2 4.5)" />
        {/* Head — a small circle */}
        <circle cx="6" cy="11" r="4.4" fill="var(--jtb-gold-200, #E6C885)" />
        {/* Eye — single dark dot */}
        <circle cx="4.6" cy="10.6" r="0.55" fill="#08080B" />
      </g>
    </svg>
  );
}

/**
 * Signed-out landing screen.
 *
 * Goals (per product brief):
 *   1. Open the demo without gating — and let the visitor *choose* which
 *      book to step into. We surface all four public-domain demo books
 *      (Alice, Dracula, Frankenstein, Sherlock) as clickable cards using
 *      their first scene art as a thumbnail. Each card deep-links to
 *      /experience/{id}?chapter=1, which the experience page already
 *      handles for signed-out visitors via the DEMO_BOOKS fallback.
 *   2. Get straight to the point: Jump the Book is a reading companion
 *      that paints what you're reading, scene-by-scene, spoiler-free.
 *   3. Shout out the image generation: an example gallery of cinematic
 *      scenes for popular contemporary titles (Dungeon Crawler Carl,
 *      Project Hail Mary, The Way of Kings, Mistborn) so visitors can
 *      see the quality bar before they commit.
 *
 * Sign-in/sign-up still live in the header for returning users, but the
 * primary action is the demo picker, not account creation.
 */

interface DemoBook {
  /** Matches DEMO_BOOKS[].id so /experience/:id resolves correctly. */
  id: string;
  title: string;
  author: string;
  /** One-line tease, shown under the title. Spoiler-free. */
  hook: string;
  /** Path under /public — first scene of chapter 1 for that book. */
  thumbnail: string;
  /** Loading background until the image paints. */
  gradient: string;
  /** Display tag in the corner, e.g. "Fantasy". */
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
    src: "scenes/landing/stormlight.png",
    title: "The Way of Kings",
    author: "Brandon Sanderson",
    caption: "A highstorm on the Shattered Plains.",
    gradient: "linear-gradient(135deg, #0a0a1a, #1a1a3a, #3a3a7a)",
  },
  {
    src: "scenes/landing/mistborn.png",
    title: "Mistborn: The Final Empire",
    author: "Brandon Sanderson",
    caption: "Mist over Luthadel.",
    gradient: "linear-gradient(135deg, #1a0a08, #3a0a08, #6a1a18)",
  },
];

const BASE = import.meta.env.BASE_URL;

/* ──────────────────────────────────────────────────────────────────────────
 * PhoneWalkthrough
 *
 * Interactive in-page demo that teaches the entire mechanic in 10 seconds:
 *
 *   1. "Pick the book you're reading"  → tap Project Hail Mary
 *   2. "Tap the chapter you're on"     → tap Chapter 7
 *   3. "Boom — the scene appears"      → painted scene fills the phone
 *
 * Auto-advances every ~3.5s; pauses on hover; user can tap the highlighted
 * row on each screen to advance manually, or click the progress dots to jump.
 * Shaped like a phone because the app is mobile-first and we want the
 * visitor to immediately picture using this on their own device.
 * ────────────────────────────────────────────────────────────────────────── */

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
  // Pause sources tracked separately so a manual click can't override an
  // active hover/focus pause. Autoplay only resumes when *both* are false.
  const [hoverPaused, setHoverPaused] = useState(false);
  const [manualPaused, setManualPaused] = useState(false);
  const paused = hoverPaused || manualPaused;
  // Single managed timer for the manual-pause auto-resume so we never leak
  // dangling timeouts on rapid taps or unmount.
  const resumeTimerRef = useRef<number | null>(null);
  const STEPS = 3;

  useEffect(() => {
    if (paused) return;
    const dur = step === 2 ? 4500 : 3200;
    const t = window.setTimeout(() => setStep((s) => (s + 1) % STEPS), dur);
    return () => window.clearTimeout(t);
  }, [step, paused]);

  // Cleanup any pending resume timer on unmount.
  useEffect(() => {
    return () => {
      if (resumeTimerRef.current !== null) {
        window.clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
    };
  }, []);

  // jumpTo: explicit step change from a user tap (advance arrow or dot).
  // Pauses for a beat so the step they just chose has time to land, then
  // resumes autoplay — but only the *manual* pause; hover pause is untouched.
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
      {/* Brand-tinted halo behind the phone */}
      <div
        aria-hidden="true"
        className="absolute -inset-12 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(55% 55% at 50% 45%, rgba(242,42,140,0.28), rgba(242,42,140,0.08) 55%, transparent 75%)",
          filter: "blur(10px)",
        }}
      />
      {/* Phone shell */}
      <div className="relative w-[280px] h-[572px] mx-auto rounded-[44px] bg-[#0a0510] p-[10px] ring-2 ring-[hsl(271,30%,18%)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)_inset]">
        {/* Notch */}
        <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-24 h-[22px] rounded-b-2xl bg-black z-30" />
        {/* Screen */}
        <div className="relative w-full h-full rounded-[34px] overflow-hidden bg-[hsl(271,40%,8%)]">
          {/* Mock status bar */}
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
      {/* Ground shadow */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-[60%] h-5 pointer-events-none"
        style={{
          background:
            "radial-gradient(50% 100% at 50% 0%, rgba(0,0,0,0.55), transparent 70%)",
          filter: "blur(6px)",
        }}
      />
      {/* Progress dots */}
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

export default function Home() {
  return (
    <div className="min-h-[100dvh] dark bg-background text-foreground">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 backdrop-blur bg-background/70 border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="Jump the Book — home"
          >
            <img
              src={`${BASE}logo-mark.svg`}
              alt=""
              aria-hidden="true"
              className="w-7 h-7 transition-transform group-hover:scale-105"
            />
            <span className="font-serif text-base sm:text-lg tracking-tight">
              Jump <em className="not-italic italic text-primary">the</em> Book
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex items-center justify-center h-9 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center h-9 px-3 sm:px-4 rounded-md bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 transition-colors text-sm font-medium"
            >
              Create account
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Soft glow behind the hero so the page feels "lit" rather than flat. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 30%, rgba(201,169,106,0.18), transparent 70%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-10 sm:pb-16 grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="space-y-6 sm:space-y-7"
          >
            <div className="inline-flex items-center gap-2 jtb-eyebrow">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--jtb-spark)" }}
              />
              <span>See the book you're reading</span>
            </div>
            <h1 className="font-serif tracking-[-0.025em] leading-[0.98] text-foreground text-[44px] sm:text-[60px] lg:text-[72px]">
              The chapter you're on,{" "}
              <em className="not-italic italic text-primary">painted.</em>
            </h1>
            {/* Animated bunny hop trail under the H1 — quiet personality
                accent and the first appearance of the magenta spark colour. */}
            <BunnyHop width={240} animate className="-mt-1 opacity-90" />
            <p className="text-muted-foreground text-base sm:text-lg max-w-[560px] leading-relaxed">
              Tell Jump the Book what you're reading and what chapter you're
              on. We paint the scene — like a movie still, made just for that
              moment. Spoiler-free. Nothing from later in the book leaks in.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
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

          {/* Hero right column — interactive phone walkthrough. Replaces the
              static screenshot with a clickable mini-app that teaches the
              entire mechanic (pick book → pick chapter → scene appears) in
              under 10 seconds. Auto-advances; pauses on hover; tappable. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="relative mx-auto lg:mx-0"
          >
            <PhoneWalkthrough />
          </motion.div>
        </div>
      </section>

      {/* ── Showcase gallery — recognition proof for contemporary titles.
          This is the "wow" moment, placed RIGHT after the hero so visitors
          see a book they've actually read (DCC, PHM, Sanderson) painted as
          a cinematic scene. The recognition does the selling. ──────────── */}
      <section className="relative border-t border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 jtb-eyebrow">
              <Sparkles
                className="w-3.5 h-3.5"
                style={{ color: "var(--jtb-spark)" }}
              />
              <span>Whatever you're reading — here's a taste</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl tracking-tight">
              Recognise any of these?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Real scenes from books people are reading right now —
              Brandon Sanderson, Andy Weir, Matt Dinniman. Drop in your
              EPUB and we'll do the same for the chapter you're on, in
              the visual style you pick. Characters stay consistent across
              chapters so a face you saw on page 40 still looks like the
              same person on page 400.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {SHOWCASE.map((s, i) => (
              <motion.figure
                key={s.src}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
                className="group relative overflow-hidden rounded-xl ring-1 ring-border/60 hover:ring-primary/30 transition-all"
                style={{ background: s.gradient }}
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={`${BASE}${s.src}`}
                    alt={`Generated scene from ${s.title} by ${s.author}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                    width={1280}
                    height={800}
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
                  <p className="text-[10px] uppercase tracking-wider text-primary/90 font-semibold">
                    {s.author}
                  </p>
                  <p className="font-serif text-base sm:text-lg leading-tight text-white">
                    {s.title}
                  </p>
                  <p className="text-xs text-white/70 mt-0.5">{s.caption}</p>
                </div>
              </motion.figure>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground/70 pt-2">
            Examples generated by Jump the Book. Book titles and authors are
            shown for illustration; covers and trademarks belong to their
            respective rights holders.
          </p>
        </div>
      </section>

      {/* Hop divider — geometric magenta arc carrying the bunny from the
          showcase wow into the no-signup classics fallback. */}
      <div className="relative flex justify-center -my-3 z-10 pointer-events-none">
        <BunnyHop width={180} className="opacity-80" />
      </div>

      {/* ── Classics demo picker ──────────────────────────────────────────────
          Sits AFTER the showcase deliberately: contemporary recognition is
          the wow moment; classics are the no-signup fallback for visitors
          not ready to upload. */}
      <section
        id="classics"
        className="relative border-t border-border/40 bg-[hsl(271,40%,7%)] scroll-mt-16"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 jtb-eyebrow">
              <Play
                className="w-3.5 h-3.5"
                style={{ color: "var(--jtb-spark)" }}
              />
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
                  className="group relative block overflow-hidden rounded-xl ring-1 ring-border/60 transition-all hover:-translate-y-0.5"
                  style={{
                    background: demo.gradient,
                    // Hover state: magenta glow ring + lift, in addition to
                    // the translate above. Inline so it can use the spark var.
                    ["--hover-ring" as string]: "var(--jtb-glow-spark)",
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
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                  </div>
                  {/* Top badge — magenta spark border + text */}
                  <span
                    className="absolute top-3 left-3 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded bg-black/65 backdrop-blur"
                    style={{
                      color: "var(--jtb-spark-hi)",
                      border: "1px solid var(--jtb-spark-soft)",
                    }}
                  >
                    {demo.badge}
                  </span>
                  {/* Bottom info overlay */}
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
                    <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
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
      <section className="relative border-t border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            <Feature
              icon={<ShieldCheck className="w-5 h-5" />}
              title="Spoiler-safe by default"
              body="Tell us the chapter you're on. We'll never paint anything that hasn't happened yet — no betrayals, no twists, no dying characters before their time."
            />
            <Feature
              icon={<ImageIcon className="w-5 h-5" />}
              title="Six visual styles"
              body="Comic, watercolour, dark cinematic, manga, painterly fantasy, animated storybook. Pick a vibe per book and the whole library inherits the look."
            />
            <Feature
              icon={<BookOpen className="w-5 h-5" />}
              title="Drop in EPUB or just the title"
              body="Upload your EPUB for chapter-perfect scenes, or sign in and let the open-library lookup ground the art in real characters and places — even without the file."
            />
          </div>
        </div>
      </section>

      {/* ── Closing CTA ───────────────────────────────────────────────────── */}
      <section className="relative border-t border-border/40 bg-gradient-to-b from-transparent to-[hsl(271,45%,8%)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center space-y-6">
          {/* Big animated hop arc as the final personality beat before the CTA. */}
          <div className="flex justify-center">
            <BunnyHop width={240} animate className="opacity-95" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight">
            See your next chapter.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            The fastest way to get it is to see it. Drop in your EPUB and
            paint the chapter you're on — or step into a classic with no
            signup at all.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[10px] bg-primary text-primary-foreground border border-[rgba(255,122,194,0.45)] font-semibold text-sm hover:brightness-110 transition-[filter] shadow-[0_6px_28px_rgba(242,42,140,0.42)]"
              data-testid="link-paint-my-book-bottom"
            >
              <Upload className="w-4 h-4" />
              Paint a scene from my book
            </Link>
            <a
              href="#classics"
              className="inline-flex items-center justify-center h-12 px-6 rounded-[10px] bg-transparent text-[var(--jtb-accent-hi)] border border-[var(--jtb-border-hi)] font-semibold text-sm hover:bg-[rgba(201,169,106,0.06)] hover:border-primary transition-colors"
              data-testid="link-try-classic-bottom"
            >
              Try it on a classic
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 py-8 text-center jtb-label">
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
    <div className="space-y-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
        {icon}
      </div>
      <h3 className="font-serif text-xl tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
