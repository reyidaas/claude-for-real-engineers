import { useState } from "react";
import { useFetcher } from "react-router";
import { Star } from "lucide-react";
import { cn } from "~/lib/utils";

interface StarRatingProps {
  rating: number | null;
  reviewCount?: number;
  className?: string;
}

export function StarRating({ rating, reviewCount, className }: StarRatingProps) {
  if (rating === null && !reviewCount) return null;

  return (
    <span className={cn("flex items-center gap-1", className)}>
      <Star className="size-3.5 fill-amber-400 text-amber-400" />
      <span className="text-xs font-medium">
        {rating ? rating.toFixed(1) : "—"}
      </span>
      {reviewCount !== undefined && reviewCount > 0 && (
        <span className="text-xs text-muted-foreground">
          ({reviewCount})
        </span>
      )}
    </span>
  );
}

interface StarRatingInputProps {
  courseId: number;
  currentRating: number | null;
}

export function StarRatingInput({ courseId, currentRating }: StarRatingInputProps) {
  const fetcher = useFetcher();
  const [hovered, setHovered] = useState<number | null>(null);

  const optimisticRating =
    fetcher.state !== "idle" && fetcher.json
      ? (fetcher.json as { rating: number }).rating
      : null;

  const activeRating = optimisticRating ?? currentRating;
  const displayRating = hovered ?? activeRating;

  function handleClick(star: number) {
    fetcher.submit(
      { courseId, rating: star },
      {
        method: "post",
        action: "/api/course-reviews",
        encType: "application/json",
      }
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium">Your rating</span>
      <div
        className="flex gap-0.5"
        onMouseLeave={() => setHovered(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => setHovered(star)}
            className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                "size-6 transition-colors",
                displayRating !== null && star <= displayRating
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
