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

    const openLibrary = (await searchOpenLibrary(q)).map((item) => ({
      ...item,
      source: "open-library" as const,
      description: null,
      isbn: null,
    }));

    let results: SearchResult[] = openLibrary;
    const needsFallback =
      openLibrary.length === 0 || openLibrary.every((item) => !item.coverUrl && !item.coverUrlLarge);
    const googleKey = process.env.GOOGLE_BOOKS_API_KEY;
    if (needsFallback && googleKey) {
      const googleResults = await searchGoogleBooks(q, googleKey);
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

    if (results.length > 0) {
      await cacheResults(results);
    }
    req.log.info({ cacheHit: false, q, count: results.length }, "book search complete");
    res.json({ results });
  } catch (err) {
    req.log.error({ err, q }, "GET /books/search failed");
    res.status(500).json({ error: "Failed to search books" });
  }
});

export default router;
