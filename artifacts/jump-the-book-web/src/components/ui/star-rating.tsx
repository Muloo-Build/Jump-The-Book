import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md";
  readOnly?: boolean;
}

export default function StarRating({
  value,
  onChange,
  size = "md",
  readOnly = false,
}: Props) {
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index + 1 <= value;
        return (
          <button
            key={index}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(index + 1)}
            className={cn(
              "transition-transform",
              !readOnly && "hover:scale-110",
            )}
            aria-label={`Rate ${index + 1} star${index === 0 ? "" : "s"}`}
          >
            <Star
              className={cn(
                iconSize,
                filled
                  ? "fill-[var(--jtb-gold-200)] text-[var(--jtb-gold-200)]"
                  : "text-muted-foreground/50",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
