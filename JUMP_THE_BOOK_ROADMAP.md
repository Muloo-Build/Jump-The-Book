# Jump the Book — Feature Roadmap (Codex handoff)

This is a self-contained brief for an autonomous coding agent (Codex / similar) to
pick up the next wave of features. Each item is independent and can be built in
isolation — sequence them however you want.

The landing-page **Bookshelf showcase** (item 0) is already shipped on `main`.
What follows are items 1–5 from our planning conversation, in roughly the order
of impact-per-effort.

---

## Repo orientation

- **Monorepo:** pnpm workspaces. Root `pnpm run typecheck` is the canonical full check.
- **Web app:** `artifacts/jump-the-book-web` (React 19 + Vite + TS + Tailwind v4 + shadcn/ui + wouter + framer-motion + TanStack Query + Clerk).
- **API:** `artifacts/api-server` (Express 5 + Drizzle ORM). Logging via `req.log` (request scope) or `logger` (singleton). **Never `console.log` in server code.**
- **Shared libs:** `lib/db` (Drizzle schema), `lib/jump-the-book-shared` (Open Library helpers, types), `lib/api-spec` (OpenAPI source-of-truth, Orval-generated React Query hooks + Zod schemas).
- **Codegen:** after editing `lib/api-spec/openapi.yaml` run `pnpm --filter @workspace/api-spec run codegen`. Generated React Query hooks land in `lib/api-spec/src/generated/`.
- **DB migrations:** Drizzle Kit. Schema lives in `lib/db/src/schema/`. Use `pnpm --filter @workspace/db run db:push` for dev push.
- **Auth:** Clerk. Routes that need a user use `requireAuth` middleware (see `artifacts/api-server/src/middlewares/`). The `req.auth.userId` is the canonical user id.
- **Object Storage:** scene images stored in App Storage. See `artifacts/api-server/src/lib/objectStorage.ts`.
- **Brand grammar:** Twilight Magenta (`#D81B7A`) on aubergine, gold accents (`var(--jtb-gold-200)`, `var(--jtb-spark-hi)`), Playfair Display serif + Plus Jakarta Sans body. Mobile-first, Android Chrome primary.

---

## Item 1 — Surface format badges + filter on the bookshelf

**Why:** the `format` column already exists on `user_books` and defaults to `"Paperback"`,
but the UI doesn't use it. Surfacing it is mostly UI work and unlocks "filter my
audiobooks vs. my paperbacks" — a common reader ask.

**Scope:**
- New filter chip row on `/library` for format: `All formats / Paperback / Ebook / Audiobook`. Combine with existing status tabs (multiplicative filter).
- Format badge on `LibraryBookTile` (component already takes `book.format`).
- Format picker in `EditBookDialog` (currently doesn't expose this field).
- Format inference on EPUB upload: default to `"Ebook"` instead of `"Paperback"` when source is an EPUB file. Manual selection in the Smart Setup wizard for non-EPUB sources.
- Backend: `PATCH /me/books/:id` already accepts arbitrary fields via `serializeBook` — add `format` to the validated allow-list (currently it accepts but doesn't validate; constrain to the 3 known values + reject others).

**Files to touch:**
- `artifacts/jump-the-book-web/src/pages/library.tsx` — add format filter state + chip row
- `artifacts/jump-the-book-web/src/components/library-book-tile.tsx` — add format badge (icon: `Headphones | Tablet | BookOpen`)
- `artifacts/jump-the-book-web/src/components/edit-book-dialog.tsx` — add format select
- `artifacts/jump-the-book-web/src/pages/setup-book.tsx` — surface format picker in wizard
- `artifacts/api-server/src/routes/me.ts` — add `FORMATS` set + validation in PATCH handler
- `lib/api-spec/openapi.yaml` — add `format` enum to the book schema if not already present, then re-run codegen

**Acceptance:**
- Bookshelf can be filtered by format AND status simultaneously.
- New EPUB uploads default to `"Ebook"`.
- Editing a book lets the user change format.
- Sending an unknown format value returns 400.
- Existing books default to `"Paperback"` (no migration needed — already the column default).

---

## Item 2 — Reviews & ratings

**Why:** zero review/rating surface exists today. Adding it gives readers a reason to
return after finishing a book and provides social-proof material for the Trending
page.

**Scope:**
- New `book_reviews` table (one review per `(userId, userBookId)`):
  - `id` (uuid pk)
  - `userId` (fk users.id)
  - `userBookId` (fk user_books.id, on delete cascade)
  - `rating` (smallint, 1–5, not null)
  - `body` (text nullable, max 4000 chars)
  - `containsSpoilers` (boolean, default false)
  - `shareToTrending` (boolean, default false — mirror existing privacy-opt-in pattern from `userPreferences`)
  - `createdAt`, `updatedAt`
- Endpoints:
  - `GET /me/books/:id/review` → returns own review or 404
  - `PUT /me/books/:id/review` → upsert (Zod-validated body)
  - `DELETE /me/books/:id/review`
  - `GET /trending/reviews` → public, returns top reviews where `shareToTrending=true`, joined with book metadata + author handle
- UI:
  - Star-rating component (5 stars, half-step on hover) — add to shadcn-style `components/ui/star-rating.tsx`
  - Review card on book detail page (`/book/:id`) with edit-in-place
  - Auto-prompt to rate when status flips to `finished`
  - Add review excerpts to the Discover/Trending page below the existing trending books
- Codegen: regenerate React Query hooks after OpenAPI updates

**Files to create:**
- `lib/db/src/schema/bookReviews.ts`
- `artifacts/api-server/src/routes/reviews.ts` (mounted under `/me/books/:id/review`)
- `artifacts/api-server/src/routes/trendingReviews.ts` (mounted under `/trending/reviews`)
- `artifacts/jump-the-book-web/src/components/ui/star-rating.tsx`
- `artifacts/jump-the-book-web/src/components/review-card.tsx`
- `artifacts/jump-the-book-web/src/components/review-editor.tsx`

**Files to modify:**
- `lib/db/src/schema/index.ts` — export new table
- `artifacts/api-server/src/app.ts` — mount new routers
- `lib/api-spec/openapi.yaml` — add review schemas + paths, regenerate
- `artifacts/jump-the-book-web/src/pages/book.tsx` — embed `ReviewCard` / `ReviewEditor`
- `artifacts/jump-the-book-web/src/pages/discover.tsx` — add trending reviews section

**Acceptance:**
- A signed-in user can leave / edit / delete a review on any book in their library.
- Reviews are private by default. Toggling `shareToTrending` makes them appear on `/trending/reviews`.
- Setting status to `finished` triggers an inline prompt: "How was it? Rate this book."
- Spoiler-flagged reviews are hidden behind a "Show review (contains spoilers)" reveal.
- `pnpm run typecheck` passes; new endpoints have request validation.

---

## Item 3 — Built-in EPUB reader with inline "Paint this chapter" button (THE killer feature)

**Why:** all the hard parts (EPUB parsing, chapter extraction, scene generation,
chapter-keyed cache) are done. We're not rendering the chapter text we already
have. Adding a reader closes the loop and removes the user's need to ever leave
the app.

**User has not committed to a UX yet** — present these three options to them
when this work starts and let them pick before you build:
1. Split view (read left, scene right)
2. Full-screen reader, "Paint this scene" button overlays
3. Inline scenes auto-injected between paragraphs

**Default recommendation if no answer: option 2** (full-screen reader with overlay button) — lowest friction, mobile-friendly, doesn't require redesigning the scene viewer.

**Scope (option 2):**
- New route `/read/:bookId` rendering a paginated reader using `react-reader` (wraps `epub.js`).
- Reader source: re-parse the user's stored EPUB file from object storage. **Currently we only persist parsed chapter text, not the original EPUB file.** Need to add `epubObjectKey` column to `user_books` and start storing the original file on upload.
- Floating action button "✨ Paint this scene" in the reader. Clicking it:
  - Reads the current chapter index from the reader
  - Calls existing `POST /me/books/:id/scenes` (or whatever the scene gen endpoint is — see `artifacts/api-server/src/routes/scenes.ts`) with that chapter
  - Shows a non-blocking toast with progress, then a "View scene" link when ready
- Persist last-read location (CFI string from epub.js) on `user_books.lastReadCfi` (new column) so users resume where they left off.
- Update Now Reading "Continue" button: if `lastReadCfi` exists, link to `/read/:id` instead of `/experience/:id`.

**Dependencies to add:**
- `react-reader` (devDeps in jump-the-book-web)
- Already have `jszip`

**Files to create:**
- `artifacts/jump-the-book-web/src/pages/read.tsx`
- `artifacts/jump-the-book-web/src/components/paint-this-scene-button.tsx`

**Files to modify:**
- `lib/db/src/schema/userLibrary.ts` — add `epubObjectKey` (text nullable), `lastReadCfi` (text nullable)
- `artifacts/api-server/src/routes/me.ts` — extend EPUB upload handler to persist the file to object storage and write `epubObjectKey`; serve via signed URL
- `artifacts/jump-the-book-web/src/pages/setup-book.tsx` — change upload flow to send the raw file to a new endpoint instead of (or in addition to) parsing client-side
- `artifacts/jump-the-book-web/src/pages/now-reading.tsx` — link Continue to `/read/:id` when `lastReadCfi` present

**Open questions for the user (ask before building):**
- Which UX (split / overlay / inline)?
- For ebooks where we only have metadata (no EPUB file uploaded), what does Continue do? Disable the reader, fall back to the existing experience page, or prompt to upload?

**Acceptance:**
- Uploading an EPUB stores the file in object storage and parses chapters as today.
- Opening `/read/:id` paginates the EPUB with native swipe gestures on mobile.
- Tapping "Paint this scene" generates a scene for the current chapter and surfaces it via toast + link.
- Reader resumes at last-read position.
- Falls back gracefully when no EPUB file is on record (link to upload).

---

## Item 4 — Hardcover integration ("Import my shelf")

**Why:** Goodreads' API died in 2020. **Hardcover** is the modern public-API
alternative (free GraphQL endpoint, OAuth, growing community). Importing a
shelf removes onboarding friction for engaged readers who already have 200+
books tracked elsewhere.

**Scope:**
- OAuth handshake with Hardcover (their API requires a Bearer token; for v1, accept a user-supplied API token via Settings → Integrations rather than full OAuth, to avoid registering an OAuth app).
  - Hardcover docs: https://hardcover.app/account/api
- Backend: store the per-user token encrypted in `user_integrations` table (new), tagged `provider="hardcover"`.
- New endpoint `POST /me/integrations/hardcover/import` — fetches the user's Hardcover library via GraphQL, maps each book to a `user_books` row (matching by ISBN where present, otherwise title+author).
- Idempotent: re-importing must not create duplicates (rely on existing dedup logic in `routes/me.ts`).
- UI: new `/account/integrations` page with a Hardcover card. "Connect" → token input → "Import N books" preview → confirm.
- Honour their reading status: Hardcover statuses (`Want to Read | Currently Reading | Read | Did Not Finish`) map to ours (we don't have DNF — fold into Finished with a note, or skip).

**Files to create:**
- `lib/db/src/schema/userIntegrations.ts`
- `artifacts/api-server/src/routes/integrations/hardcover.ts`
- `artifacts/api-server/src/lib/hardcoverClient.ts` (GraphQL fetcher with retries + rate-limit awareness)
- `artifacts/jump-the-book-web/src/pages/account-integrations.tsx`

**Files to modify:**
- `artifacts/api-server/src/app.ts` — mount new router
- `lib/api-spec/openapi.yaml` — add integration endpoints
- Sidebar / account nav to include Integrations link

**Secrets:** none required to begin (user supplies own Hardcover token). If
you decide to go full OAuth later, you'll need `HARDCOVER_OAUTH_CLIENT_ID` and
`HARDCOVER_OAUTH_CLIENT_SECRET` in environment-secrets.

**Acceptance:**
- User pastes Hardcover token, hits Import, sees their shelf appear in `/library` within ~30s for a 200-book library.
- Re-importing doesn't duplicate.
- Token is encrypted at rest (use `pgcrypto` or app-level AES-GCM with a key derived from `SESSION_SECRET`).
- Disconnect button revokes the token from our DB.

---

## Item 5 — Google Books fallback when Open Library misses a title

**Why:** Open Library has gaps, especially for newer SFF/romantasy releases.
Google Books has a much larger catalog. Cheap to add as a fallback.

**Scope:**
- Add Google Books client to `lib/jump-the-book-shared` mirroring the existing `openLibrary.ts` shape.
- API: requires `GOOGLE_BOOKS_API_KEY` (free, generous quota — 1000 req/day default).
- Update `searchBooks` flow in Smart Setup to: query Open Library first → if zero results OR cover missing, fall back to Google Books.
- Cache the merged result in a new `book_metadata_cache` table keyed by `(source, externalId)` to avoid hammering either API.

**Files to create:**
- `lib/jump-the-book-shared/src/googleBooks.ts`
- `lib/db/src/schema/bookMetadataCache.ts`

**Files to modify:**
- `artifacts/api-server/src/routes/me.ts` — extend cover resolver to try Google Books when Open Library misses
- `artifacts/jump-the-book-web/src/pages/setup-book.tsx` — search results page already hits a server endpoint; that endpoint should return merged results
- `lib/jump-the-book-shared/src/index.ts` — export new module

**Secrets needed:**
- `GOOGLE_BOOKS_API_KEY` — get from Google Cloud Console, restrict to Books API. Use `environment-secrets` skill to add.

**Acceptance:**
- Searching for a 2024 release that Open Library doesn't have returns a Google Books result with cover + description.
- Cache hit rate visible in api logs (`req.log.info({ cacheHit: true }, ...)`).
- No-key behaviour: if `GOOGLE_BOOKS_API_KEY` is unset, fall back silently (just Open Library) and log a warning at startup.

---

## Cross-cutting reminders

- **Testing:** after each feature, run the testing skill with a focused test plan. Don't merge without an e2e pass.
- **Architect review:** after each feature is complete, call the code review skill (`architect`) with `evaluate_task` and `includeGitDiff: true` and address Critical/High findings before handing back.
- **`replit.md`:** keep the user-facing capabilities + architecture decisions sections in sync as features land.
- **Brand:** stay in the existing palette + typography system. Don't introduce new colours; pull from the CSS custom properties in `artifacts/jump-the-book-web/src/index.css`.
- **Mobile-first:** test every UI change at 402×900 (Pixel-class) in addition to desktop.
- **No `console.log`** in server code. Use `req.log` / `logger`.

---

## What's already done

- ✅ Landing page bookshelf showcase section (`BookshelfShowcase` in `home.tsx`) — surfaces existing library/now-reading features visually with a phone mockup + four feature bullets. No backend changes.
- ✅ ScrollBunny mascot tied to scroll progress (right-edge desktop only, respects reduced-motion, aria-hidden).
- ✅ Seamless header → hero transition (no border seam).
- ✅ Section transitions via gradient backgrounds (no hard borders between sections).

Pick up from item 1.
