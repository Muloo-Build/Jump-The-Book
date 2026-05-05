import { Link } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, ImageIcon, ShieldCheck, ArrowRight } from "lucide-react";

/**
 * Signed-out landing screen.
 *
 * Goals (per product brief):
 *   1. Open the demo without gating — the primary CTA is "Try the demo"
 *      which deep-links straight into /experience/alice (a public-domain
 *      book that already ships with pre-baked scene art, so the visitor
 *      sees the product in motion within one tap and zero accounts).
 *   2. Get straight to the point: Jump the Book is a reading companion
 *      that paints what you're reading, scene-by-scene, spoiler-free.
 *   3. Shout out the image generation: an example gallery of cinematic
 *      scenes for popular contemporary titles (Dungeon Crawler Carl,
 *      Project Hail Mary, The Way of Kings, Mistborn) so visitors can
 *      see the quality before they commit.
 *
 * Sign-in/sign-up still live in the header for returning users, but the
 * primary action is the demo, not account creation.
 */

interface Showcase {
  src: string;
  title: string;
  author: string;
  caption: string;
  /** Background gradient shown while the image is still loading. */
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
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>The reading companion that paints what you read</span>
            </div>
            <h1 className="font-serif tracking-[-0.025em] leading-[0.98] text-foreground text-[44px] sm:text-[64px] lg:text-[76px]">
              Visualise any book.{" "}
              <em className="not-italic italic text-primary">Any chapter.</em>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-[560px] leading-relaxed">
              Jump the Book turns the chapter you're on into spoiler-safe,
              cinematic scene art — so the world stops being a wall of text and
              starts feeling like a place. No spoilers, no plot summaries, just
              the room you're standing in.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/experience/alice?chapter=1"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[10px] bg-primary text-primary-foreground border border-[var(--jtb-accent-hi)] font-semibold text-sm hover:brightness-110 transition-[filter] shadow-[0_6px_24px_rgba(201,169,106,0.28)]"
                data-testid="link-try-demo"
              >
                Try the demo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center h-12 px-6 rounded-[10px] bg-transparent text-[var(--jtb-accent-hi)] border border-[var(--jtb-border-hi)] font-semibold text-sm hover:bg-[rgba(201,169,106,0.06)] hover:border-primary transition-colors"
              >
                Start a shelf
              </Link>
            </div>
            <p className="text-xs text-muted-foreground/70 pt-1">
              No account needed for the demo. Six pre-painted scenes from
              Chapter 1 of <em>Alice in Wonderland</em> — straight in, no
              email.
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

      {/* ── Showcase gallery ──────────────────────────────────────────────── */}
      <section className="relative border-t border-border/40 bg-[hsl(232,17%,5%)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 jtb-eyebrow">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Cinematic scenes, made for the chapter you're on</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl tracking-tight">
              Built to make modern fiction feel like a film.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Every scene is generated from the chapter you're actually
              reading, in the visual style you pick — comic, watercolour,
              dark cinematic, manga, painterly fantasy, animated storybook.
              Characters stay consistent across chapters so a face you saw
              on page 40 still looks like the same person on page 400.
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
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight">
            See your next chapter.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            The fastest way to feel it is to see it. Open the demo — no
            account, no email, six scenes already painted, three taps from
            here.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
            <Link
              href="/experience/alice?chapter=1"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[10px] bg-primary text-primary-foreground border border-[var(--jtb-accent-hi)] font-semibold text-sm hover:brightness-110 transition-[filter] shadow-[0_6px_24px_rgba(201,169,106,0.28)]"
              data-testid="link-try-demo-bottom"
            >
              Try the demo
              <ArrowRight className="w-4 h-4" />
            </Link>
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
