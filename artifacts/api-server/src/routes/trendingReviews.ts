import { Router, type IRouter } from "express";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { appUsersTable, bookReviewsTable, userBooksTable } from "@workspace/db/schema";

const router: IRouter = Router();

router.get("/trending/reviews", async (req, res) => {
  try {
    const rows = await db
      .select({
        id: bookReviewsTable.id,
        userId: bookReviewsTable.userId,
        rating: bookReviewsTable.rating,
        body: bookReviewsTable.body,
        containsSpoilers: bookReviewsTable.containsSpoilers,
        shareToTrending: bookReviewsTable.shareToTrending,
        createdAt: bookReviewsTable.createdAt,
        updatedAt: bookReviewsTable.updatedAt,
        bookTitle: userBooksTable.title,
        author: userBooksTable.author,
        userBookId: userBooksTable.id,
        authorHandle: sql<string>`coalesce(split_part(${appUsersTable.email}, '@', 1), left(${appUsersTable.userId}, 8))`.as("author_handle"),
      })
      .from(bookReviewsTable)
      .innerJoin(userBooksTable, eq(bookReviewsTable.userBookId, userBooksTable.id))
      .innerJoin(appUsersTable, eq(bookReviewsTable.userId, appUsersTable.userId))
      .where(eq(bookReviewsTable.shareToTrending, true))
      .orderBy(desc(bookReviewsTable.rating), desc(bookReviewsTable.updatedAt))
      .limit(20);

    res.json({
      reviews: rows.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "GET /trending/reviews failed");
    res.status(500).json({ error: "Failed to load trending reviews" });
  }
});

export default router;
