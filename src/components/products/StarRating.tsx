import { StarIcon } from 'lucide-react';

interface StarRatingProps {
  value: number;
  size?: number;
  className?: string;
  ariaLabel?: string;
}

export function StarRating({ value, size = 16, className = '', ariaLabel }: StarRatingProps) {
  const v = Math.max(0, Math.min(5, value));
  const full = Math.floor(v);
  const half = v - full >= 0.5;
  const label = ariaLabel ?? `Rated ${v.toFixed(1)} out of 5`;
  return (
    <span
      className={`inline-flex items-center gap-0.5 align-middle ${className}`}
      aria-label={label}
      role="img"
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const filled = i < full || (i === full && half);
        return (
          <StarIcon
            key={i}
            width={size}
            height={size}
            className={
              filled
                ? 'fill-amber-500 text-amber-500'
                : 'fill-transparent text-muted-foreground/40'
            }
          />
        );
      })}
    </span>
  );
}

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
}

export function StarRatingInput({ value, onChange, size = 28 }: StarRatingInputProps) {
  return (
    <div className="inline-flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= value;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} star${i === 1 ? '' : 's'}`}
            onClick={() => onChange(i)}
            className="p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <StarIcon
              width={size}
              height={size}
              className={
                filled
                  ? 'fill-amber-500 text-amber-500'
                  : 'fill-transparent text-muted-foreground/40'
              }
            />
          </button>
        );
      })}
    </div>
  );
}
