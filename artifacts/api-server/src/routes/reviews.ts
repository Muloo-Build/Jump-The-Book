import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { bookReviewsTable, userBooksTable } from "@workspace/db/schema";
import { requireAuth, type AuthedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();
router.use(requireAuth);

interface ReviewBody {
  rating?: unknown;
  body?: unknown;
  containsSpoilers?: unknown;
  shareToTrending?: unknown;
}

function serializeReview(row: typeof bookReviewsTable.$inferSelect) {
  return {
    id: row.id,
    userId: row.userId,
    userBookId: row.userBookId,
    rating: row.rating,
    body: row.body,
    containsSpoilers: row.containsSpoilers,
    shareToTrending: row.shareToTrending,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function findOwnedBook(userId: string, bookId: string) {
  const [book] = await db
    .select()
    .from(userBooksTable)
    .where(and(eq(userBooksTable.id, bookId), eq(userBooksTable.userId, userId)))
    .limit(1);
  return book ?? null;
}

router.get("/me/books/:id/review", async (req, res) => {
  try {
    const userId = (req as unknown as AuthedRequest).userId;
    const book = await findOwnedBook(userId, req.params.id);
    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }
    const [review] = await db
      .select()
      .from(bookReviewsTable)
      .where(
        and(
          eq(bookReviewsTable.userId, userId),
          eq(bookReviewsTable.userBookId, book.id),
        ),
      )
      .limit(1);
    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }
    res.json({ review: serializeReview(review) });
  } catch (err) {
    req.log.error({ err }, "GET /me/books/:id/review failed");
    res.status(500).json({ error: "Failed to load review" });
  }
});

router.put("/me/books/:id/review", async (req, res) => {
  try {
    const userId = (req as unknown as AuthedRequest).userId;
    const book = await findOwnedBook(userId, req.params.id);
    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }
    const body = (req.body ?? {}) as ReviewBody;
    const rating = typeof body.rating === "number" ? Math.round(body.rating) : NaN;
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ error: "rating must be 1-5" });
      return;
    }
    const reviewBody =
      body.body == null
        ? null
        : typeof body.body === "string"
          ? body.body.trim().slice(0, 4000) || null
          : null;
    if (body.body !== undefined && typeof body.body !== "string" && body.body !== null) {
      res.status(400).json({ error: "body must be a string or null" });
      return;
    }
    if (
      body.containsSpoilers !== undefined &&
      typeof body.containsSpoilers !== "boolean"
    ) {
      res.status(400).json({ error: "containsSpoilers must be a boolean" });
      return;
    }
    if (
      body.shareToTrending !== undefined &&
      typeof body.shareToTrending !== "boolean"
    ) {
      res.status(400).json({ error: "shareToTrending must be a boolean" });
      return;
    }

    const [existing] = await db
      .select()
      .from(bookReviewsTable)
      .where(
        and(
          eq(bookReviewsTable.userId, userId),
          eq(bookReviewsTable.userBookId, book.id),
        ),
      )
      .limit(1);

    const now = new Date();
    const values = {
      userId,
      userBookId: book.id,
      rating,
      body: reviewBody,
      containsSpoilers: body.containsSpoilers === true,
      shareToTrending: body.shareToTrending === true,
      updatedAt: now,
    };

    const [saved] = existing
      ? await db
          .update(bookReviewsTable)
          .set(values)
          .where(eq(bookReviewsTable.id, existing.id))
          .returning()
      : await db
          .insert(bookReviewsTable)
          .values({ ...values, createdAt: now })
          .returning();

    res.json({ review: serializeReview(saved) });
  } catch (err) {
    req.log.error({ err }, "PUT /me/books/:id/review failed");
    res.status(500).json({ error: "Failed to save review" });
  }
});

router.delete("/me/books/:id/review", async (req, res) => {
  try {
    const userId = (req as unknown as AuthedRequest).userId;
    const book = await findOwnedBook(userId, req.params.id);
    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }
    await db
      .delete(bookReviewsTable)
      .where(
        and(
          eq(bookReviewsTable.userId, userId),
          eq(bookReviewsTable.userBookId, book.id),
        ),
      );
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "DELETE /me/books/:id/review failed");
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
