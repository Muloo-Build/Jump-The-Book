import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { bookMetadataCacheTable } from "@workspace/db/schema";
import { sql } from "drizzle-orm";
import {
  searchGoogleBooks,
  searchOpenLibrary,
  type GoogleBooksSearchResult,
  type OpenLibrarySearchResult,
} from "@workspace/jump-the-book-shared";

const router: IRouter = Router();

type SearchResult = (OpenLibrarySearchResult | GoogleBooksSearchResult) & {
  source?: "open-library" | "google-books";
  description?: string | null;
  isbn?: string | null;
};

const CURATED_RESULTS: SearchResult[] = [
  {
    key: "curated-phm",
    workKey: "curated-phm",
    title: "Project Hail Mary",
    author: "Andy Weir",
    firstPublishYear: 2021,
    pageCount: null,
    coverUrl:
      "https://covers.openlibrary.org/b/isbn/9780593135204-M.jpg",
    coverUrlLarge:
      "https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg",
    source: "open-library",
    description: "A lone astronaut wakes up far from Earth with one impossible mission.",
    isbn: "9780593135204",
  },
  {
    key: "curated-fourth-wing",
    workKey: "curated-fourth-wing",
    title: "Fourth Wing",
    author: "Rebecca Yarros",
    firstPublishYear: 2023,
    pageCount: null,
    coverUrl:
      "https://covers.openlibrary.org/b/isbn/9781649374042-M.jpg",
    coverUrlLarge:
      "https://covers.openlibrary.org/b/isbn/9781649374042-L.jpg",
    source: "open-library",
    description: "A dragon-rider fantasy with brutal training and high-stakes loyalty.",
    isbn: "9781649374042",
  },
  {
    key: "curated-way-of-kings",
    workKey: "curated-way-of-kings",
    title: "The Way of Kings",
    author: "Brandon Sanderson",
    firstPublishYear: 2010,
    pageCount: null,
    coverUrl:
      "https://covers.openlibrary.org/b/isbn/9780765365279-M.jpg",
    coverUrlLarge:
      "https://covers.openlibrary.org/b/isbn/9780765365279-L.jpg",
    source: "open-library",
    description: "An epic opening to the Stormlight Archive on a world of storms and shattered plains.",
    isbn: "9780765365279",
  },
  {
    key: "curated-dcc",
    workKey: "curated-dcc",
    title: "Dungeon Crawler Carl",
    author: "Matt Dinniman",
    firstPublishYear: 2020,
    pageCount: null,
    coverUrl:
      "https://covers.openlibrary.org/b/isbn/9780593820247-M.jpg",
    coverUrlLarge:
      "https://covers.openlibrary.org/b/isbn/9780593820248-L.jpg",
    source: "open-library",
    description: "A wild dungeon-crawl apocalypse with a cat, a survivor, and a televised death game.",
    isbn: "9780593820248",
  },
  {
    key: "curated-dune",
    workKey: "curated-dune",
    title: "Dune",
    author: "Frank Herbert",
    firstPublishYear: 1965,
    pageCount: null,
    coverUrl:
      "https://covers.openlibrary.org/b/isbn/9780441172719-M.jpg",
    coverUrlLarge:
      "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg",
    source: "open-library",
    description: "A desert world, prophecy, politics, and giant worms in the sand.",
    isbn: "9780441172719",
  },
  {
    key: "curated-mistborn",
    workKey: "curated-mistborn",
    title: "Mistborn: The Final Empire",
    author: "Brandon Sanderson",
    firstPublishYear: 2006,
    pageCount: null,
    coverUrl:
      "https://covers.openlibrary.org/b/isbn/9780765311788-M.jpg",
    coverUrlLarge:
      "https://covers.openlibrary.org/b/isbn/9780765311788-L.jpg",
    source: "open-library",
    description: "Ash falls from the sky while thieves plan the impossible.",
    isbn: "9780765311788",
  },
];

function curatedMatches(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return CURATED_RESULTS.filter((item) => {
    const haystack = `${item.title} ${item.author}`.toLowerCase();
    return haystack.includes(q);
  });
}

async function tryOpenLibrarySearch(
  q: string,
  req: any,
): Promise<SearchResult[]> {
  try {
    return (await searchOpenLibrary(q)).map((item) => ({
      ...item,
      source: "open-library" as const,
      description: null,
      isbn: null,
    }));
  } catch (err) {
    req.log.warn({ err, q }, "Open Library search failed, falling back");
    return [];
  }
}

async function tryGoogleBooksSearch(
  q: string,
  apiKey: string | undefined,
  req: any,
): Promise<SearchResult[]> {
  if (!apiKey) return [];
  try {
    return await searchGoogleBooks(q, apiKey);
  } catch (err) {
    req.log.warn({ err, q }, "Google Books search failed, falling back");
    return [];
  }
}

async function cacheResults(results: SearchResult[]) {
  for (const result of results) {
    const source = result.source ?? "open-library";
    await db
      .insert(bookMetadataCacheTable)
      .values({
        source,
        externalId: result.key,
        title: result.title,
        author: result.author,
        isbn: "isbn" in result ? result.isbn ?? null : null,
        description: "description" in result ? result.description ?? null : null,
        coverUrl: result.coverUrlLarge ?? result.coverUrl ?? null,
        payload: result,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [bookMetadataCacheTable.source, bookMetadataCacheTable.externalId],
        set: {
          title: result.title,
          author: result.author,
          isbn: "isbn" in result ? result.isbn ?? null : null,
          description: "description" in result ? result.description ?? null : null,
          coverUrl: result.coverUrlLarge ?? result.coverUrl ?? null,
          payload: result,
          updatedAt: new Date(),
        },
      });
  }
}

router.get("/books/search", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!q) {
    res.status(400).json({ error: "q is required" });
    return;
  }
  try {
    const cached = await db
      .select()
      .from(bookMetadataCacheTable)
      .where(
        sql`lower(${bookMetadataCacheTable.title}) like ${`%${q.toLowerCase()}%`}`,
      )
      .limit(12);
    if (cached.length > 0) {
      req.log.info({ cacheHit: true, q }, "book metadata cache hit");
    }

    const openLibrary = await tryOpenLibrarySearch(q, req);

    let results: SearchResult[] = openLibrary;
    const needsFallback =
      openLibrary.length === 0 || openLibrary.every((item) => !item.coverUrl && !item.coverUrlLarge);
    const googleKey = process.env.GOOGLE_BOOKS_API_KEY;
    if (needsFallback && googleKey) {
      const googleResults = await tryGoogleBooksSearch(q, googleKey, req);
      const merged = new Map<string, SearchResult>();
      for (const item of openLibrary) {
        merged.set(`${item.title.toLowerCase()}|||${item.author.toLowerCase()}`, item);
      }
      for (const item of googleResults) {
        const key = `${item.title.toLowerCase()}|||${item.author.toLowerCase()}`;
        if (!merged.has(key)) merged.set(key, item);
      }
      results = [...merged.values()];
    }

    const curated = curatedMatches(q);
    if (results.length > 0 && curated.length > 0) {
      const merged = new Map<string, SearchResult>();
      for (const item of curated) {
        merged.set(`${item.title.toLowerCase()}|||${item.author.toLowerCase()}`, item);
      }
      for (const item of results) {
        const key = `${item.title.toLowerCase()}|||${item.author.toLowerCase()}`;
        if (!merged.has(key)) merged.set(key, item);
      }
      results = [...merged.values()].slice(0, 12);
    }

    if (results.length === 0) {
      const merged = new Map<string, SearchResult>();
      for (const item of curated) {
        merged.set(`${item.title.toLowerCase()}|||${item.author.toLowerCase()}`, item);
      }
      for (const item of cached.map((row) => row.payload as SearchResult)) {
        const key = `${item.title.toLowerCase()}|||${item.author.toLowerCase()}`;
        if (!merged.has(key)) merged.set(key, item);
      }
      results = [...merged.values()].slice(0, 12);
    }

    if (results.length > 0) {
      await cacheResults(results);
    }
    req.log.info(
      {
        cacheHit: cached.length > 0,
        q,
        count: results.length,
        usedCuratedFallback: results.some((item) => item.key.startsWith("curated-")),
      },
      "book search complete",
    );
    res.json({ results });
  } catch (err) {
    req.log.error({ err, q }, "GET /books/search failed");
    res.status(500).json({ error: "Failed to search books" });
  }
});

export default router;
