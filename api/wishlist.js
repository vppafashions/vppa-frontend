// Vercel Serverless Function: Wishlist operations via Appwrite API key
import { corsHeaders, listDocuments, createDocument, deleteDocument, COLLECTION_IDS, Query } from './_appwrite.js';

export default async function handler(req, res) {
  corsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const collectionId = COLLECTION_IDS.wishlists;

  try {
    // GET /api/wishlist?userId=xxx — list wishlist items
    if (req.method === 'GET') {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: 'userId required' });

      const data = await listDocuments(collectionId, [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt'),
        Query.limit(100),
      ]);
      return res.status(200).json(data);
    }

    // POST /api/wishlist — add to wishlist
    if (req.method === 'POST') {
      const { userId, productId, name, price, image, collectionSlug } = req.body;
      if (!userId || !productId) return res.status(400).json({ error: 'userId and productId required' });

      // Check if already in wishlist
      const existing = await listDocuments(collectionId, [
        Query.equal('userId', userId),
        Query.equal('productId', productId),
        Query.limit(1),
      ]);
      if (existing.documents.length > 0) {
        return res.status(200).json({ alreadyExists: true, $id: existing.documents[0].$id });
      }

      const doc = await createDocument(collectionId, 'unique()', {
        userId, productId, name, price, image: image || '', collectionSlug: collectionSlug || '',
      });
      return res.status(201).json(doc);
    }

    // DELETE /api/wishlist — remove from wishlist
    if (req.method === 'DELETE') {
      const { docId } = req.body;
      if (!docId) return res.status(400).json({ error: 'docId required' });

      await deleteDocument(collectionId, docId);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Wishlist API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
