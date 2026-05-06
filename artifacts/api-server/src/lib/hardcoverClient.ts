import { logger } from "./logger";

const HARDCOVER_API_URL = "https://api.hardcover.app/v1/graphql";

export interface HardcoverBook {
  title: string;
  author: string;
  isbn: string | null;
  status: "Want to Read" | "Currently Reading" | "Read" | "Did Not Finish";
}

interface GraphQlResponse<T> {
  data?: T;
  errors?: Array<{ message?: string }>;
}

interface HardcoverLibraryQuery {
  me: Array<{
    user_books: Array<{
      status: string | null;
      book: {
        title: string | null;
        isbn_13: string | null;
        isbn_10: string | null;
        contributions: Array<{
          author: { name: string | null } | null;
        }> | null;
      } | null;
    }>;
  }>;
}

const LIBRARY_QUERY = `
  query HardcoverLibrary {
    me {
      user_books {
        status
        book {
          title
          isbn_13
          isbn_10
          contributions {
            author {
              name
            }
          }
        }
      }
    }
  }
`;

async function hardcoverFetch<T>(
  token: string,
  query: string,
  attempt = 1,
): Promise<T> {
  const res = await fetch(HARDCOVER_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
  });

  if (res.status === 429 && attempt < 3) {
    const retryAfter = Number(res.headers.get("retry-after") ?? "1");
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
    return hardcoverFetch<T>(token, query, attempt + 1);
  }

  if (!res.ok) {
    throw new Error(`Hardcover request failed (${res.status})`);
  }

  const json = (await res.json()) as GraphQlResponse<T>;
  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message || "Hardcover query failed");
  }
  if (!json.data) {
    throw new Error("Hardcover returned no data");
  }
  return json.data;
}

export async function fetchHardcoverLibrary(token: string): Promise<HardcoverBook[]> {
  const data = await hardcoverFetch<HardcoverLibraryQuery>(token, LIBRARY_QUERY);
  const rows = data.me?.[0]?.user_books ?? [];
  const books = rows
    .map((row) => {
      const book = row.book;
      const title = book?.title?.trim() ?? "";
      const author =
        book?.contributions?.find((entry) => entry.author?.name?.trim())?.author?.name?.trim() ??
        "Unknown Author";
      const status = normalizeHardcoverStatus(row.status);
      if (!title || !status) return null;
      return {
        title,
        author,
        status,
        isbn: book?.isbn_13 ?? book?.isbn_10 ?? null,
      } satisfies HardcoverBook;
    })
    .filter((value): value is HardcoverBook => value !== null);

  logger.info({ count: books.length }, "fetched Hardcover library");
  return books;
}

export async function validateHardcoverToken(token: string): Promise<number> {
  const books = await fetchHardcoverLibrary(token);
  return books.length;
}

function normalizeHardcoverStatus(
  raw: string | null,
): HardcoverBook["status"] | null {
  switch ((raw ?? "").trim()) {
    case "Want to Read":
      return "Want to Read";
    case "Currently Reading":
      return "Currently Reading";
    case "Read":
      return "Read";
    case "Did Not Finish":
      return "Did Not Finish";
    default:
      return null;
  }
}
