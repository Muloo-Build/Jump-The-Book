export const BOOK_FORMATS = ["Paperback", "Ebook", "Audiobook"] as const;

export type BookFormat = (typeof BOOK_FORMATS)[number];

export const DEFAULT_BOOK_FORMAT: BookFormat = "Paperback";

export function isBookFormat(value: unknown): value is BookFormat {
  return typeof value === "string" && BOOK_FORMATS.includes(value as BookFormat);
}

export function normalizeBookFormat(value: unknown): BookFormat {
  return isBookFormat(value) ? value : DEFAULT_BOOK_FORMAT;
}
