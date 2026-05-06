import { Router, type IRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { userBooksTable, userIntegrationsTable } from "@workspace/db/schema";
import { DEFAULT_BOOK_FORMAT } from "@workspace/jump-the-book-shared";
import { decryptString, encryptString } from "../../lib/crypto";
import {
  fetchHardcoverLibrary,
  validateHardcoverToken,
} from "../../lib/hardcoverClient";
import { requireAuth, type AuthedRequest } from "../../middlewares/requireAuth";

const router: IRouter = Router();
router.use(requireAuth);

function statusFromHardcover(raw: string) {
  switch (raw) {
    case "Want to Read":
      return "want-to-read" as const;
    case "Currently Reading":
      return "reading" as const;
    case "Read":
    case "Did Not Finish":
      return "finished" as const;
    default:
      return "reading" as const;
  }
}

router.get("/me/integrations/hardcover", async (req, res) => {
  try {
    const userId = (req as AuthedRequest).userId;
    const [integration] = await db
      .select()
      .from(userIntegrationsTable)
      .where(
        and(
          eq(userIntegrationsTable.userId, userId),
          eq(userIntegrationsTable.provider, "hardcover"),
        ),
      )
      .limit(1);
    res.json({ connected: !!integration });
  } catch (err) {
    req.log.error({ err }, "GET /me/integrations/hardcover failed");
    res.status(500).json({ error: "Failed to load integration" });
  }
});

router.post("/me/integrations/hardcover/connect", async (req, res) => {
  try {
    const userId = (req as AuthedRequest).userId;
    const token =
      typeof req.body?.token === "string" ? req.body.token.trim() : "";
    if (!token) {
      res.status(400).json({ error: "token is required" });
      return;
    }
    const previewCount = await validateHardcoverToken(token);
    await db
      .insert(userIntegrationsTable)
      .values({
        userId,
        provider: "hardcover",
        encryptedToken: encryptString(token),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userIntegrationsTable.userId, userIntegrationsTable.provider],
        set: {
          encryptedToken: encryptString(token),
          updatedAt: new Date(),
        },
      });
    res.json({ connected: true, previewCount });
  } catch (err) {
    req.log.error({ err }, "POST /me/integrations/hardcover/connect failed");
    res.status(400).json({ error: err instanceof Error ? err.message : "Failed to connect Hardcover" });
  }
});

router.delete("/me/integrations/hardcover", async (req, res) => {
  try {
    const userId = (req as AuthedRequest).userId;
    await db
      .delete(userIntegrationsTable)
      .where(
        and(
          eq(userIntegrationsTable.userId, userId),
          eq(userIntegrationsTable.provider, "hardcover"),
        ),
      );
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "DELETE /me/integrations/hardcover failed");
    res.status(500).json({ error: "Failed to disconnect Hardcover" });
  }
});

router.post("/me/integrations/hardcover/import", async (req, res) => {
  try {
    const userId = (req as AuthedRequest).userId;
    const [integration] = await db
      .select()
      .from(userIntegrationsTable)
      .where(
        and(
          eq(userIntegrationsTable.userId, userId),
          eq(userIntegrationsTable.provider, "hardcover"),
        ),
      )
      .limit(1);
    if (!integration) {
      res.status(404).json({ error: "Hardcover is not connected" });
      return;
    }

    const library = await fetchHardcoverLibrary(decryptString(integration.encryptedToken));
    const existing = await db
      .select()
      .from(userBooksTable)
      .where(eq(userBooksTable.userId, userId))
      .orderBy(desc(userBooksTable.updatedAt));

    const byExact = new Map(
      existing.map((book) => [
        `${book.title.trim().toLowerCase()}|||${book.author.trim().toLowerCase()}`,
        book,
      ]),
    );

    let imported = 0;
    let updated = 0;
    for (const item of library) {
      const key = `${item.title.toLowerCase()}|||${item.author.toLowerCase()}`;
      const match = byExact.get(key);
      const nextStatus = statusFromHardcover(item.status);
      const note =
        item.status === "Did Not Finish"
          ? "Imported from Hardcover as Did Not Finish."
          : null;
      if (match) {
        await db
          .update(userBooksTable)
          .set({
            readingStatus: nextStatus,
            userNote: note ? [match.userNote, note].filter(Boolean).join("\n") : match.userNote,
            updatedAt: new Date(),
          })
          .where(eq(userBooksTable.id, match.id));
        updated += 1;
        continue;
      }
      const [created] = await db
        .insert(userBooksTable)
        .values({
          userId,
          title: item.title,
          author: item.author,
          format: DEFAULT_BOOK_FORMAT,
          source: "manual",
          coverGradient: [],
          visualStyle: "fantasy-illustration",
          spoilerMode: "no-spoilers",
          currentChapter: 1,
          currentPage: 0,
          currentAudioTimestamp: "00:00:00",
          progress: nextStatus === "finished" ? 100 : 0,
          userNote: note ?? "",
          readingStatus: nextStatus,
        })
        .returning();
      byExact.set(key, created);
      imported += 1;
    }

    res.json({ imported, updated, total: library.length });
  } catch (err) {
    req.log.error({ err }, "POST /me/integrations/hardcover/import failed");
    res.status(500).json({ error: "Failed to import Hardcover library" });
  }
});

export default router;
