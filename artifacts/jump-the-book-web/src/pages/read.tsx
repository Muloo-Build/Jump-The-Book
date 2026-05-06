import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { ReactReader } from "react-reader";
import Layout from "@/components/layout";
import PaintThisSceneButton from "@/components/paint-this-scene-button";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/queryClient";
import { useGenerateScene } from "@/hooks/useGenerateScene";
import { usePatchRemoteBook, useRemoteBooks } from "@/hooks/useApiLibrary";

export default function ReadPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const remoteBooks = useRemoteBooks();
  const patchBook = usePatchRemoteBook();
  const { generateScenesWithImages, isWorking } = useGenerateScene();
  const [url, setUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [chapterIndex, setChapterIndex] = useState(0);

  const book = useMemo(
    () => (remoteBooks.data ?? []).find((entry) => entry.id === id),
    [remoteBooks.data, id],
  );

  useEffect(() => {
    let active = true;
    if (!id) return;
    void (async () => {
      try {
        const result = await apiFetch<{ url: string }>(`/me/books/${id}/epub-url`);
        if (!active) return;
        setUrl(result.url);
        setLocation(book?.lastReadCfi ?? null);
      } catch {
        if (!active) return;
        setUrl(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, book?.lastReadCfi]);

  const saveLocation = async (nextLocation: string) => {
    setLocation(nextLocation);
    if (!id) return;
    void patchBook.mutateAsync({ id, lastReadCfi: nextLocation }).catch(() => {});
  };

  const paintScene = async () => {
    if (!book) return;
    toast({ title: "Painting your current chapter…" });
    const result = await generateScenesWithImages({
      bookTitle: book.title,
      author: book.author,
      chapterTitle: `Chapter ${chapterIndex + 1}`,
      chapterNumber: chapterIndex + 1,
      visualStyle: book.visualStyle,
      spoilerMode: book.spoilerMode,
      bookBibleId: undefined,
      sceneCount: 1,
    });
    if (result?.scenes?.[0]) {
      toast({
        title: "Scene ready",
        description: result.scenes[0].title,
      });
    }
  };

  if (!book) {
    return (
      <Layout hideNav>
        <div className="flex min-h-screen items-center justify-center px-4">
          <p className="text-sm text-muted-foreground">Loading book…</p>
        </div>
      </Layout>
    );
  }

  if (!book.epubObjectKey || !url) {
    return (
      <Layout>
        <div className="container mx-auto max-w-3xl px-4 py-10 space-y-4">
          <h1 className="font-serif text-3xl font-semibold">{book.title}</h1>
          <p className="text-sm text-muted-foreground">
            This book does not have an EPUB on file yet.
          </p>
          <div className="flex gap-2">
            <Link href="/upload">
              <Button>Upload EPUB</Button>
            </Link>
            <Link href={`/experience/${book.id}?chapter=${book.currentChapter ?? 1}`}>
              <Button variant="outline">Open scene experience</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNav>
      <div className="relative h-screen bg-background">
        <ReactReader
          url={url}
          location={location ?? null}
          locationChanged={saveLocation}
          getRendition={(rendition) => {
            rendition.on("relocated", (loc: { start?: { index?: number } }) => {
              setChapterIndex(loc.start?.index ?? 0);
            });
          }}
        />
        <div className="absolute bottom-6 right-4 z-50">
          <PaintThisSceneButton onClick={paintScene} disabled={isWorking} />
        </div>
      </div>
    </Layout>
  );
}
