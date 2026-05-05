import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  ImageIcon,
  ShieldCheck,
  ArrowRight,
  Play,
} from "lucide-react";

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
            cx={d.x * W}
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
      {/* Bunny silhouette at the apex — geometric, matches the brand mark */}
      <g transform={`translate(${dots[8].x * W - 6}, ${H - 6 - dots[8].y * (H - 12) - 14})`}>
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
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-10 sm:pb-16 grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
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
              <span>The reading companion that paints what you read</span>
            </div>
            <h1 className="font-serif tracking-[-0.025em] leading-[0.98] text-foreground text-[44px] sm:text-[64px] lg:text-[76px]">
              Visualise any book.{" "}
              <em className="not-italic italic text-primary">Any chapter.</em>
            </h1>
            {/* Animated bunny hop trail under the H1 — quiet personality
                accent and the first appearance of the magenta spark colour. */}
            <BunnyHop width={220} animate className="-mt-1 -ml-1 opacity-90" />
            <p className="text-muted-foreground text-base sm:text-lg max-w-[560px] leading-relaxed">
              Jump the Book turns the chapter you're on into spoiler-safe,
              cinematic scene art — so the world stops being a wall of text and
              starts feeling like a place. No spoilers, no plot summaries, just
              the room you're standing in.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <a
                href="#try-demo"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[10px] bg-primary text-primary-foreground border border-[var(--jtb-accent-hi)] font-semibold text-sm hover:brightness-110 transition-[filter] shadow-[0_6px_24px_rgba(201,169,106,0.28)]"
                data-testid="link-try-demo"
              >
                Pick a demo
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center h-12 px-6 rounded-[10px] bg-transparent text-[var(--jtb-accent-hi)] border border-[var(--jtb-border-hi)] font-semibold text-sm hover:bg-[rgba(201,169,106,0.06)] hover:border-primary transition-colors"
              >
                Start a shelf
              </Link>
            </div>
            <p className="text-xs text-muted-foreground/70 pt-1">
              No account needed. Four classic books are pre-painted and ready
              to step into — pick one below.
            </p>
          </motion.div>

          {/* Hero image — first showcase tile, bigger and tilted. */}
          <motion.div
            initial={{ opacity: 0, y: 20, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: -1.5 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="relative mx-auto lg:mx-0 w-full max-w-[520px]"
          >
            <div
              className="aspect-[16/10] rounded-2xl overflow-hidden ring-1 ring-primary/25 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
              style={{ background: SHOWCASE[0].gradient }}
            >
              <img
                src={`${BASE}${SHOWCASE[0].src}`}
                alt={`Generated scene from ${SHOWCASE[0].title}`}
                className="w-full h-full object-cover"
                loading="eager"
                width={1280}
                height={800}
              />
            </div>
            <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 bg-background/95 backdrop-blur border border-primary/30 rounded-lg px-3 py-2 shadow-xl">
              <p className="text-[10px] uppercase tracking-wider text-primary/80 font-semibold">
                Now reading
              </p>
              <p className="font-serif text-sm leading-tight">
                {SHOWCASE[0].title}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {SHOWCASE[0].caption}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Try-a-demo picker ─────────────────────────────────────────────── */}
      <section
        id="try-demo"
        className="relative border-t border-border/40 bg-[hsl(232,17%,5%)] scroll-mt-16"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 jtb-eyebrow">
              <Play
                className="w-3.5 h-3.5"
                style={{ color: "var(--jtb-spark)" }}
              />
              <span>Step into a book — no account needed</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl tracking-tight">
              Pick a demo and see for yourself.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Four classics, fully painted. Tap any cover to drop straight
              into the cinematic reader. Use the arrow keys, or the chevrons
              on screen, to step through the scenes.
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

      {/* Hop divider — geometric magenta arc carrying the bunny from the
          picker section into the showcase. */}
      <div className="relative flex justify-center -my-3 z-10 pointer-events-none">
        <BunnyHop width={180} className="opacity-80" />
      </div>

      {/* ── Showcase gallery (capability proof for popular titles) ───────── */}
      <section className="relative border-t border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 jtb-eyebrow">
              <Sparkles
                className="w-3.5 h-3.5"
                style={{ color: "var(--jtb-spark)" }}
              />
              <span>Built for the books you actually read</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl tracking-tight">
              Made to make modern fiction feel like a film.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Drop in the chapter you're on, in the visual style you pick —
              comic, watercolour, dark cinematic, manga, painterly fantasy,
              animated storybook. Characters stay consistent across chapters
              so a face you saw on page 40 still looks like the same person
              on page 400.
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
      <section className="relative border-t border-border/40 bg-gradient-to-b from-transparent to-[hsl(232,17%,6%)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center space-y-6">
          {/* Big animated hop arc as the final personality beat before the CTA. */}
          <div className="flex justify-center">
            <BunnyHop width={240} animate className="opacity-95" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight">
            See your next chapter.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            The fastest way to feel it is to see it. Pick a demo above, no
            account, no email — or start your own shelf and bring your own
            books.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
            <a
              href="#try-demo"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[10px] bg-primary text-primary-foreground border border-[var(--jtb-accent-hi)] font-semibold text-sm hover:brightness-110 transition-[filter] shadow-[0_6px_24px_rgba(201,169,106,0.28)]"
              data-testid="link-try-demo-bottom"
            >
              Pick a demo
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center h-12 px-6 rounded-[10px] bg-transparent text-[var(--jtb-accent-hi)] border border-[var(--jtb-border-hi)] font-semibold text-sm hover:bg-[rgba(201,169,106,0.06)] hover:border-primary transition-colors"
            >
              Create your shelf
            </Link>
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
