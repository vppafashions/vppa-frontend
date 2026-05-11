// Vercel Serverless Function: Product reviews via Appwrite API key
// GET   /api/reviews?productId=xxx          -> list reviews for a product
// GET   /api/reviews?productId=xxx&summary=1 -> { avg, count, distribution }
// POST  /api/reviews                         -> create a review (public, no auth)
// DELETE /api/reviews                        -> admin-only (X-Admin-Secret header)

import {
  corsHeaders,
  listDocuments,
  createDocument,
  deleteDocument,
  COLLECTION_IDS,
  Query,
} from './_appwrite.js';

const ADMIN_SECRET = process.env.REVIEWS_ADMIN_SECRET || process.env.APPWRITE_API_KEY;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitize(s, maxLen) {
  if (typeof s !== 'string') return '';
  return s.trim().slice(0, maxLen);
}

export default async function handler(req, res) {
  corsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const collectionId = COLLECTION_IDS.reviews;

  try {
    if (req.method === 'GET') {
      const { productId, summary, limit: limitParam } = req.query;
      if (!productId) return res.status(400).json({ error: 'productId required' });

      const queries = [
        Query.equal('productId', productId),
        Query.equal('approved', true),
        Query.orderDesc('$createdAt'),
        Query.limit(limitParam ? clamp(parseInt(limitParam, 10), 1, 100) : 50),
      ];

      let data;
      try {
        data = await listDocuments(collectionId, queries);
      } catch (err) {
        // Collection may not exist yet on first deploy — treat as empty.
        if (/not found|404/i.test(err.message)) {
          return res.status(200).json(
            summary ? { avg: 0, count: 0, distribution: [0, 0, 0, 0, 0] } : { documents: [], total: 0 },
          );
        }
        throw err;
      }

      const docs = data.documents || [];

      // Never expose email publicly
      const cleaned = docs.map((d) => ({
        $id: d.$id,
        $createdAt: d.$createdAt,
        productId: d.productId,
        rating: d.rating,
        title: d.title,
        comment: d.comment,
        authorName: d.authorName,
        photoUrl: d.photoUrl || '',
      }));

      if (summary) {
        const count = cleaned.length;
        const distribution = [0, 0, 0, 0, 0];
        let sum = 0;
        for (const r of cleaned) {
          const idx = clamp(Math.round(r.rating), 1, 5) - 1;
          distribution[idx]++;
          sum += r.rating;
        }
        const avg = count > 0 ? sum / count : 0;
        return res.status(200).json({ avg, count, distribution });
      }

      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      return res.status(200).json({ documents: cleaned, total: cleaned.length });
    }

    if (req.method === 'POST') {
      const { productId, rating, title, comment, authorName, authorEmail, photoUrl } = req.body || {};

      if (!productId) return res.status(400).json({ error: 'productId required' });
      const r = Number(rating);
      if (!Number.isFinite(r) || r < 1 || r > 5) {
        return res.status(400).json({ error: 'rating must be 1-5' });
      }
      const cleanTitle = sanitize(title, 120);
      const cleanComment = sanitize(comment, 2000);
      const cleanName = sanitize(authorName, 80);
      const cleanEmail = sanitize(authorEmail, 120);

      if (!cleanTitle) return res.status(400).json({ error: 'title required' });
      if (!cleanComment) return res.status(400).json({ error: 'comment required' });
      if (!cleanName) return res.status(400).json({ error: 'authorName required' });
      if (!isValidEmail(cleanEmail)) return res.status(400).json({ error: 'valid authorEmail required' });

      const payload = {
        productId: String(productId),
        rating: Math.round(r),
        title: cleanTitle,
        comment: cleanComment,
        authorName: cleanName,
        authorEmail: cleanEmail,
        approved: true,
      };
      const cleanPhoto = sanitize(photoUrl, 500);
      if (cleanPhoto) payload.photoUrl = cleanPhoto;

      const doc = await createDocument(collectionId, 'unique()', payload);

      // Return the public-safe version
      return res.status(201).json({
        $id: doc.$id,
        $createdAt: doc.$createdAt,
        productId: doc.productId,
        rating: doc.rating,
        title: doc.title,
        comment: doc.comment,
        authorName: doc.authorName,
        photoUrl: doc.photoUrl || '',
      });
    }

    if (req.method === 'DELETE') {
      const provided = req.headers['x-admin-secret'] || (req.body && req.body.adminSecret);
      if (!ADMIN_SECRET || provided !== ADMIN_SECRET) {
        return res.status(401).json({ error: 'unauthorized' });
      }
      const docId = (req.body && req.body.docId) || req.query.docId;
      if (!docId) return res.status(400).json({ error: 'docId required' });
      await deleteDocument(collectionId, docId);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Reviews API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
