import { useEffect, useRef, useState } from 'react';
import { XIcon, ImagePlusIcon, Trash2Icon, Loader2Icon } from 'lucide-react';
import { Button } from '../ui/Button';
import { StarRatingInput } from './StarRating';
import { submitReview, uploadReviewPhoto } from '../../lib/reviews';

interface WriteReviewModalProps {
  productId: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export function WriteReviewModal({
  productId,
  productName,
  isOpen,
  onClose,
  onSubmitted,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setTitle('');
      setComment('');
      setAuthorName('');
      setAuthorEmail('');
      setPhotoFile(null);
      setPhotoPreview('');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.');
      return;
    }
    setError('');
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function clearPhoto() {
    setPhotoFile(null);
    setPhotoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (rating < 1) return setError('Please select a star rating.');
    if (!title.trim()) return setError('Please add a title.');
    if (!comment.trim()) return setError('Please write a comment.');
    if (!authorName.trim()) return setError('Please enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail.trim())) {
      return setError('Please enter a valid email.');
    }

    setSubmitting(true);
    try {
      let photoUrl: string | undefined;
      if (photoFile) {
        setUploading(true);
        try {
          photoUrl = await uploadReviewPhoto(photoFile);
        } finally {
          setUploading(false);
        }
      }

      await submitReview({
        productId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        authorName: authorName.trim(),
        authorEmail: authorEmail.trim(),
        photoUrl,
      });
      onSubmitted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background border border-border max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-serif text-lg">Write a review</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5 truncate max-w-[20rem]">
              {productName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent/10 transition-colors"
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form className="flex-1 overflow-auto p-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Your rating
            </label>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="Sums up your experience"
              className="w-full h-11 border border-border bg-background px-3 text-sm focus:border-foreground outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={2000}
              rows={5}
              placeholder="What did you like or dislike? Fit, fabric, quality…"
              className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-foreground outline-none resize-none"
            />
            <p className="text-[10px] text-muted-foreground mt-1">{comment.length}/2000</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                maxLength={80}
                placeholder="Displayed publicly"
                className="w-full h-11 border border-border bg-background px-3 text-sm focus:border-foreground outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                maxLength={120}
                placeholder="Not shown publicly"
                className="w-full h-11 border border-border bg-background px-3 text-sm focus:border-foreground outline-none"
              />
            </div>
          </div>

          {photoPreview ? (
            <div>
              <div className="relative inline-block">
                <img
                  src={photoPreview}
                  alt="Review photo preview"
                  className="h-20 w-20 object-cover border border-border"
                />
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="absolute -top-2 -right-2 bg-background border border-border p-1 hover:bg-accent/10"
                  aria-label="Remove photo"
                >
                  <Trash2Icon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
              <ImagePlusIcon className="w-3.5 h-3.5" />
              Attach a photo (optional)
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handlePhotoSelect}
              />
            </label>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>

        <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={submitting || uploading}
            onClick={handleSubmit}
            className="min-w-[8rem]"
          >
            {submitting || uploading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2Icon className="w-4 h-4 animate-spin" />
                {uploading ? 'Uploading…' : 'Posting…'}
              </span>
            ) : (
              'Post review'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
