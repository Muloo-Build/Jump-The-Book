import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import StarRating from "@/components/ui/star-rating";
import type { RemoteReview } from "@/hooks/useApiLibrary";

interface Props {
  review: RemoteReview;
  authorLabel?: string;
}

export default function ReviewCard({ review, authorLabel = "You" }: Props) {
  const [revealed, setRevealed] = useState(false);
  const hidden = review.containsSpoilers && !revealed;

  return (
    <Card className="border-border/50 bg-card/30">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">{authorLabel}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(review.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <StarRating value={review.rating} readOnly size="sm" />
        </div>
        {hidden ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="text-sm text-[var(--jtb-accent-hi)] underline underline-offset-2"
          >
            Show review (contains spoilers)
          </button>
        ) : review.body ? (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {review.body}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">No written review.</p>
        )}
      </CardContent>
    </Card>
  );
}
