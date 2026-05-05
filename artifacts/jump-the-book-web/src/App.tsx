import { useEffect, useRef } from "react";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  Show,
  useAuth,
  useClerk,
} from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import {
  Switch,
  Route,
  Redirect,
  useLocation,
  Router as WouterRouter,
} from "wouter";
import {
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { queryClient, setApiTokenGetter } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import { useRemoteUser } from "@/hooks/useApiLibrary";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Library from "@/pages/library";
import Upload from "@/pages/upload";
import Generate from "@/pages/generate";
import BookDetail from "@/pages/book-detail";
import Position from "@/pages/position";
import Experience from "@/pages/experience";
import Comic from "@/pages/comic";
import Help from "@/pages/help";
import Onboarding from "@/pages/onboarding";
import SetupBook from "@/pages/setup-book";
import Playback from "@/pages/playback";
import Discover from "@/pages/discover";
import Account from "@/pages/account";
import SceneShare from "@/pages/scene-share";
import NowReading from "@/pages/now-reading";
import { useLibrary } from "@/lib/library";

// In production the Clerk proxy runs on the current host; derive the
// publishable key from window.location so the same build serves multiple
// custom domains. In development the proxy isn't active, so use the
// configured dev publishable key directly (falls back to Clerk's CDN).
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const clerkPubKey = clerkProxyUrl
  ? publishableKeyFromHost(
      window.location.hostname,
      import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    )
  : import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo-mark.svg`,
  },
  variables: {
    // Twilight Magenta v2.0 — magenta primary on aubergine.
    // mag-500 = #D81B7A (HSL 329 78% 48%) — AA-safe with white text.
    colorPrimary: "hsl(329, 78%, 48%)",
    colorForeground: "hsl(43, 41%, 90%)",
    colorMutedForeground: "hsl(33, 9%, 60%)",
    colorDanger: "hsl(9, 53%, 54%)",
    colorBackground: "hsl(271, 50%, 6%)",  // aub-900
    colorInput: "hsl(271, 30%, 13%)",      // aub-input
    colorInputForeground: "hsl(43, 41%, 90%)",
    colorNeutral: "hsl(271, 25%, 18%)",    // aub-600 hover surface
    fontFamily: "'Inter', system-ui, sans-serif",
    borderRadius: "0.625rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox:
      "bg-[hsl(271,40%,9%)] border border-[rgba(242,42,140,0.18)] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-2xl shadow-[rgba(242,42,140,0.10)]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle:
      "font-serif text-2xl font-medium text-[hsl(43,41%,92%)] tracking-tight",
    headerSubtitle: "text-[hsl(33,9%,60%)] text-sm",
    socialButtonsBlockButton:
      "border-[rgba(242,42,140,0.20)] hover:bg-[hsl(271,25%,16%)] transition-colors",
    socialButtonsBlockButtonText:
      "text-[hsl(43,41%,90%)] font-medium",
    formFieldLabel: "text-[hsl(43,41%,84%)] font-medium",
    formFieldInput:
      "bg-[hsl(271,30%,13%)] border-[rgba(242,42,140,0.20)] text-[hsl(43,41%,90%)]",
    formButtonPrimary:
      "bg-[hsl(329,78%,48%)] hover:brightness-110 text-white font-semibold transition-[filter]",
    // Footer "Sign up" / "Sign in" link keeps a warm gold tint — the only
    // intentional gold inside Clerk, nodding to the dual-metal brand.
    footerActionLink:
      "text-[hsl(41,65%,71%)] hover:text-[hsl(43,41%,92%)] font-medium",
    footerActionText: "text-[hsl(33,9%,60%)]",
    footerAction: "border-t border-[rgba(242,42,140,0.12)] pt-4",
    dividerLine: "bg-[rgba(242,42,140,0.20)]",
    dividerText:
      "text-[hsl(31,11%,42%)] text-[10px] uppercase tracking-[0.2em] font-mono",
    identityPreviewEditButton: "text-[hsl(329,90%,72%)]",
    formFieldSuccessText: "text-[hsl(165,22%,55%)]",
    alertText: "text-[hsl(43,41%,90%)]",
    alert: "bg-[hsl(9,30%,12%)] border-[hsl(9,40%,28%)]",
    logoBox: "mb-2",
    logoImage: "h-10 w-auto",
    otpCodeFieldInput:
      "bg-[hsl(271,30%,13%)] border-[rgba(242,42,140,0.20)] text-[hsl(43,41%,90%)]",
    formFieldRow: "space-y-2",
    main: "px-6 py-2",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background dark px-4 py-12">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background dark px-4 py-12">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </div>
  );
}

// Bridges Clerk's session token into the plain `apiFetch` helper so every
// request carries `Authorization: Bearer <jwt>`. Cookie-only auth silently
// breaks on mobile Safari (ITP) and inside in-app browsers, which is why
// "books appear to save but the library stays empty" — the POST sometimes
// works but the follow-up GET drops the cookie and returns 401.
function ClerkAuthBridge() {
  const { getToken, isLoaded } = useAuth();
  useEffect(() => {
    if (!isLoaded) return;
    setApiTokenGetter(() => getToken());
    return () => setApiTokenGetter(null);
  }, [getToken, isLoaded]);
  return null;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const id = user?.id ?? null;
      if (prevRef.current !== undefined && prevRef.current !== id) {
        qc.clear();
      }
      prevRef.current = id;
    });
    return unsubscribe;
  }, [addListener, qc]);
  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <SignedInHome />
      </Show>
      <Show when="signed-out">
        <Home />
      </Show>
    </>
  );
}

function SignedInHome() {
  const { data, isLoading } = useRemoteUser();
  const { userLibrary } = useLibrary();
  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background dark text-foreground">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    );
  }
  if (!data?.onboarded) return <Redirect to="/onboarding" />;

  // State-based landing: send users to the place that's most useful for
  // their current state, instead of always dumping them on Now Reading
  // (which is empty for users who haven't started anything yet).
  const hasAnyBooks = userLibrary.length > 0;
  const hasReadingBook = userLibrary.some(
    (b) => (b.readingStatus ?? "reading") === "reading" && (b.progress ?? 0) < 100,
  );

  if (hasReadingBook) return <Redirect to="/now-reading" />;
  if (hasAnyBooks) return <Redirect to="/library" />;
  return <Redirect to="/upload" />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey!}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkAuthBridge />
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          {/* App-wide safety net so a single render-time throw can't
           *  white-screen the user. The boundary lives inside the providers
           *  so the recovery UI still has Clerk + tooltip context. */}
          <ErrorBoundary>
            <Switch>
              <Route path="/" component={HomeRedirect} />
              <Route path="/sign-in/*?" component={SignInPage} />
              <Route path="/sign-up/*?" component={SignUpPage} />
              <Route path="/onboarding">
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              </Route>
              <Route path="/account/*?" component={Account} />
              <Route path="/now-reading" component={NowReading} />
              <Route path="/library" component={Library} />
              <Route path="/discover" component={Discover} />
              <Route path="/upload" component={Upload} />
              <Route path="/setup-book" component={SetupBook} />
              <Route path="/generate" component={Generate} />
              <Route path="/book/:id" component={BookDetail} />
              <Route path="/position/:id" component={Position} />
              <Route path="/experience/:id" component={Experience} />
              <Route path="/comic/:id" component={Comic} />
              <Route path="/playback/:id" component={Playback} />
              <Route path="/help" component={Help} />
              <Route path="/scene-share" component={SceneShare} />
              <Route component={NotFound} />
            </Switch>
          </ErrorBoundary>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
