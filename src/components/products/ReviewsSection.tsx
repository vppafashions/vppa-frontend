import { useState } from 'react';
import { Button } from '../ui/Button';
import { StarRating } from './StarRating';
import { useReviews } from '../../hooks/useReviews';
import { WriteReviewModal } from './WriteReviewModal';
import type { Review } from '../../lib/reviews';

interface ReviewsSectionProps {
  productId: string;
  productName: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="py-6 border-b border-border/40 last:border-b-0">
      <div className="flex items-center gap-3 mb-2">
        <StarRating value={review.rating} size={14} />
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
          {review.rating}/5
        </span>
      </div>
      <h3 className="text-sm font-medium mb-1">{review.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {review.comment}
      </p>
      {review.photoUrl && (
        <a
          href={review.photoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3"
        >
          <img
            src={review.photoUrl}
            alt={`Photo from ${review.authorName}`}
            className="h-24 w-24 object-cover border border-border hover:opacity-80 transition-opacity"
            loading="lazy"
          />
        </a>
      )}
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-3">
        {review.authorName} &middot; {formatDate(review.$createdAt)}
      </p>
    </article>
  );
}

export function ReviewsSection({ productId, productName }: ReviewsSectionProps) {
  const { reviews, summary, loading, refresh } = useReviews(productId);
  const [modalOpen, setModalOpen] = useState(false);
  const [visible, setVisible] = useState(5);

  const shown = reviews.slice(0, visible);
  const hasMore = reviews.length > visible;
  const total = summary.count;
  const maxBar = Math.max(...summary.distribution, 1);

  return (
    <section className="py-12 md:py-16 border-t border-border/50" aria-labelledby="reviews-heading">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 id="reviews-heading" className="font-serif text-2xl md:text-3xl mb-2">
            Customer Reviews
          </h2>
          {total > 0 ? (
            <div className="flex items-center gap-3">
              <StarRating value={summary.avg} size={18} />
              <span className="text-sm text-muted-foreground">
                {summary.avg.toFixed(1)} &middot; {total} review{total === 1 ? '' : 's'}
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No reviews yet. Be the first to share your experience.</p>
          )}
        </div>
        <Button variant="outline" onClick={() => setModalOpen(true)} className="md:w-auto w-full">
          Write a review
        </Button>
      </div>

      {total > 0 && (
        <div className="mb-8 max-w-md space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.distribution[star - 1];
            const pct = total > 0 ? (count / maxBar) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-10 text-muted-foreground tabular-nums">{star} ★</span>
                <div className="flex-1 h-2 bg-accent/20 overflow-hidden rounded-sm">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${pct}%` }}
                    aria-hidden
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground tabular-nums">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {loading && reviews.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">Loading reviews…</div>
      ) : (
        <div>
          {shown.map((r) => (
            <ReviewCard key={r.$id} review={r} />
          ))}
          {hasMore && (
            <div className="text-center mt-6">
              <Button variant="outline" onClick={() => setVisible((v) => v + 10)}>
                Show more reviews
              </Button>
            </div>
          )}
        </div>
      )}

      <WriteReviewModal
        productId={productId}
        productName={productName}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmitted={refresh}
      />
    </section>
  );
}
