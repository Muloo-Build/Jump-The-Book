export interface GoogleBooksSearchResult {
  key: string;
  title: string;
  author: string;
  firstPublishYear: number | null;
  pageCount: number | null;
  coverUrl: string | null;
  coverUrlLarge: string | null;
  workKey: string;
  description: string | null;
  source: "google-books";
  isbn: string | null;
}

interface GoogleBooksApiResponse {
  items?: Array<{
    id: string;
    volumeInfo?: {
      title?: string;
      authors?: string[];
      publishedDate?: string;
      pageCount?: number;
      description?: string;
      imageLinks?: {
        smallThumbnail?: string;
        thumbnail?: string;
      };
      industryIdentifiers?: Array<{
        type?: string;
        identifier?: string;
      }>;
    };
  }>;
}

function parseYear(publishedDate: string | undefined): number | null {
  if (!publishedDate) return null;
  const match = publishedDate.match(/^(\d{4})/);
  return match ? Number(match[1]) : null;
}

function normalizeImage(url: string | undefined, zoom: 1 | 2): string | null {
  if (!url) return null;
  const clean = url.replace(/^http:\/\//, "https://");
  return `${clean}${clean.includes("?") ? "&" : "?"}zoom=${zoom}`;
}

export async function searchGoogleBooks(
  query: string,
  apiKey: string,
  signal?: AbortSignal,
): Promise<GoogleBooksSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const url =
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(trimmed)}` +
    `&maxResults=12&projection=lite&key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`Google Books search failed (${res.status})`);
  }
  const data = (await res.json()) as GoogleBooksApiResponse;
  return (data.items ?? [])
    .map((item) => {
      const info = item.volumeInfo ?? {};
      const title = info.title?.trim() ?? "";
      const author = info.authors?.[0]?.trim() ?? "Unknown Author";
      const isbn =
        info.industryIdentifiers?.find((entry) => entry.identifier)?.identifier ?? null;
      if (!title) return null;
      return {
        key: item.id,
        workKey: item.id,
        title,
        author,
        firstPublishYear: parseYear(info.publishedDate),
        pageCount: info.pageCount ?? null,
        coverUrl: normalizeImage(info.imageLinks?.thumbnail, 1),
        coverUrlLarge: normalizeImage(
          info.imageLinks?.smallThumbnail ?? info.imageLinks?.thumbnail,
          2,
        ),
        description: info.description?.trim() ?? null,
        source: "google-books" as const,
        isbn,
      } satisfies GoogleBooksSearchResult;
    })
    .filter((value): value is GoogleBooksSearchResult => value !== null);
}
