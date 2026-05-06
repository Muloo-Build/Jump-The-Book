import { useEffect, useState } from "react";
import StarRating from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  useDeleteRemoteReview,
  useUpsertRemoteReview,
  type RemoteReview,
} from "@/hooks/useApiLibrary";
import { useToast } from "@/hooks/use-toast";

interface Props {
  bookId: string;
  review?: RemoteReview | null;
  defaultOpen?: boolean;
  onSaved?: () => void;
}

export default function ReviewEditor({
  bookId,
  review,
  defaultOpen = false,
  onSaved,
}: Props) {
  const { toast } = useToast();
  const upsert = useUpsertRemoteReview();
  const remove = useDeleteRemoteReview();
  const [open, setOpen] = useState(defaultOpen || !review);
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [body, setBody] = useState(review?.body ?? "");
  const [containsSpoilers, setContainsSpoilers] = useState(
    review?.containsSpoilers ?? false,
  );
  const [shareToTrending, setShareToTrending] = useState(
    review?.shareToTrending ?? false,
  );

  useEffect(() => {
    setRating(review?.rating ?? 0);
    setBody(review?.body ?? "");
    setContainsSpoilers(review?.containsSpoilers ?? false);
    setShareToTrending(review?.shareToTrending ?? false);
    if (defaultOpen) setOpen(true);
  }, [review, defaultOpen]);

  const save = async () => {
    if (rating < 1) return;
    await upsert.mutateAsync({
      bookId,
      rating,
      body,
      containsSpoilers,
      shareToTrending,
    });
    toast({ title: "Review saved" });
    setOpen(false);
    onSaved?.();
  };

  const removeReview = async () => {
    await remove.mutateAsync(bookId);
    toast({ title: "Review deleted" });
    setOpen(false);
    onSaved?.();
  };

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        {review ? "Edit review" : "Write a review"}
      </Button>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border/50 bg-card/30 p-4">
      <div className="space-y-2">
        <Label>Your rating</Label>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="review-body">Thoughts</Label>
        <Textarea
          id="review-body"
          rows={5}
          maxLength={4000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What landed for you?"
        />
      </div>
      <div className="flex flex-col gap-3 text-sm">
        <label className="flex items-center gap-2">
          <Checkbox
            checked={containsSpoilers}
            onCheckedChange={(checked) => setContainsSpoilers(checked === true)}
          />
          <span>Contains spoilers</span>
        </label>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={shareToTrending}
            onCheckedChange={(checked) => setShareToTrending(checked === true)}
          />
          <span>Share to trending</span>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={save} disabled={upsert.isPending || rating < 1}>
          Save review
        </Button>
        {review && (
          <Button
            variant="outline"
            onClick={removeReview}
            disabled={remove.isPending}
          >
            Delete
          </Button>
        )}
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
