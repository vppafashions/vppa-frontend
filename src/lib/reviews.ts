export interface Review {
  $id: string;
  $createdAt: string;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  authorName: string;
  photoUrl?: string;
}

export interface ReviewSummary {
  avg: number;
  count: number;
  distribution: [number, number, number, number, number];
}

export interface NewReviewInput {
  productId: string;
  rating: number;
  title: string;
  comment: string;
  authorName: string;
  authorEmail: string;
  photoUrl?: string;
}

const API = '/api/reviews';

export async function listReviews(productId: string): Promise<Review[]> {
  const res = await fetch(`${API}?productId=${encodeURIComponent(productId)}`);
  if (!res.ok) throw new Error(`Failed to load reviews: ${res.status}`);
  const data = await res.json();
  return data.documents || [];
}

export async function getReviewSummary(productId: string): Promise<ReviewSummary> {
  const res = await fetch(`${API}?productId=${encodeURIComponent(productId)}&summary=1`);
  if (!res.ok) throw new Error(`Failed to load review summary: ${res.status}`);
  return res.json();
}

export async function submitReview(input: NewReviewInput): Promise<Review> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to submit review: ${res.status}`);
  }
  return res.json();
}

// Cloudinary unsigned upload — same cloud/preset used by the backoffice.
const CLOUDINARY_CLOUD = 'dp6k1cln0';
const CLOUDINARY_PRESET = 'vppa_unsigned';

export async function uploadReviewPhoto(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', CLOUDINARY_PRESET);
  form.append('folder', 'reviews');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`Photo upload failed: ${res.status}`);
  const data = await res.json();
  return data.secure_url as string;
}
