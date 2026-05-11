import { useCallback, useEffect, useState } from 'react';
import { listReviews, getReviewSummary, type Review, type ReviewSummary } from '../lib/reviews';

export function useReviews(productId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({
    avg: 0,
    count: 0,
    distribution: [0, 0, 0, 0, 0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const [list, sum] = await Promise.all([
        listReviews(productId),
        getReviewSummary(productId),
      ]);
      setReviews(list);
      setSummary(sum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      refresh();
    }
  }, [productId, refresh]);

  return { reviews, summary, loading, error, refresh };
}
