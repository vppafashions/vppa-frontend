// Vercel Serverless Function: Cart CRUD operations via Appwrite API key
import { corsHeaders, listDocuments, createDocument, updateDocument, deleteDocument, COLLECTION_IDS, Query } from './_appwrite.js';

function uniqueId() {
  return 'unique()';
}

export default async function handler(req, res) {
  corsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const collectionId = COLLECTION_IDS.carts;

  try {
    // GET /api/cart?userId=xxx — list cart items
    if (req.method === 'GET') {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: 'userId required' });

      const data = await listDocuments(collectionId, [
        Query.equal('userId', userId),
        Query.limit(100),
      ]);
      return res.status(200).json(data);
    }

    // POST /api/cart — add item to cart
    if (req.method === 'POST') {
      const { userId, productId, name, price, size, color, quantity, image } = req.body;
      if (!userId || !productId) return res.status(400).json({ error: 'userId and productId required' });

      // Check if same product/size/color exists
      const existing = await listDocuments(collectionId, [
        Query.equal('userId', userId),
        Query.equal('productId', productId),
        Query.equal('size', size),
        Query.equal('color', color),
        Query.limit(1),
      ]);

      if (existing.documents.length > 0) {
        const doc = existing.documents[0];
        const newQty = doc.quantity + (quantity || 1);
        const updated = await updateDocument(collectionId, doc.$id, { quantity: newQty });
        return res.status(200).json(updated);
      }

      const doc = await createDocument(collectionId, uniqueId(), {
        userId, productId, name, price, size, color, quantity: quantity || 1, image: image || '',
      }, [
        `read("user:${userId}")`,
        `update("user:${userId}")`,
        `delete("user:${userId}")`,
      ]);
      return res.status(201).json(doc);
    }

    // PUT /api/cart — update item quantity
    if (req.method === 'PUT') {
      const { docId, quantity } = req.body;
      if (!docId) return res.status(400).json({ error: 'docId required' });

      const updated = await updateDocument(collectionId, docId, { quantity });
      return res.status(200).json(updated);
    }

    // DELETE /api/cart — remove item or clear cart
    if (req.method === 'DELETE') {
      const { docId, userId, clearAll } = req.body;

      if (clearAll && userId) {
        const items = await listDocuments(collectionId, [
          Query.equal('userId', userId),
          Query.limit(100),
        ]);
        await Promise.all(items.documents.map((doc) => deleteDocument(collectionId, doc.$id)));
        return res.status(200).json({ success: true, deleted: items.documents.length });
      }

      if (docId) {
        await deleteDocument(collectionId, docId);
        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: 'docId or (userId + clearAll) required' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Cart API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
