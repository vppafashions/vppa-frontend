// Vercel Serverless Function: Address CRUD operations via Appwrite API key
import { corsHeaders, listDocuments, createDocument, updateDocument, deleteDocument, COLLECTION_IDS, Query } from './_appwrite.js';

export default async function handler(req, res) {
  corsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const collectionId = COLLECTION_IDS.addresses;

  try {
    // GET /api/addresses?userId=xxx — list all addresses for a user
    if (req.method === 'GET') {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: 'userId required' });

      const data = await listDocuments(collectionId, [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt'),
      ]);
      return res.status(200).json(data.documents);
    }

    // POST /api/addresses — create a new address
    if (req.method === 'POST') {
      const {
        userId, label, firstName, lastName, phone,
        address, landmark, city, state, pincode, country, isDefault,
      } = req.body;

      if (!userId || !firstName || !lastName || !phone || !address || !city || !state || !pincode) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // If this is set as default, unset other defaults
      if (isDefault) {
        const existing = await listDocuments(collectionId, [
          Query.equal('userId', userId),
        ]);
        for (const doc of existing.documents) {
          if (doc.isDefault) {
            await updateDocument(collectionId, doc.$id, { isDefault: false });
          }
        }
      }

      // If this is the first address, make it default
      const existingCount = await listDocuments(collectionId, [
        Query.equal('userId', userId),
        Query.limit(1),
      ]);
      const shouldBeDefault = isDefault || existingCount.documents.length === 0;

      const payload = {
        userId,
        label: label || 'Home',
        firstName,
        lastName,
        phone,
        address,
        landmark: landmark || '',
        city,
        state,
        pincode,
        country: country || 'India',
        isDefault: shouldBeDefault,
      };

      const doc = await createDocument(collectionId, 'unique()', payload);
      return res.status(201).json(doc);
    }

    // PUT /api/addresses — update an existing address
    if (req.method === 'PUT') {
      const { addressId, userId, ...updates } = req.body;
      if (!addressId) return res.status(400).json({ error: 'addressId required' });

      // If setting as default, unset other defaults
      if (updates.isDefault && userId) {
        const existing = await listDocuments(collectionId, [
          Query.equal('userId', userId),
        ]);
        for (const doc of existing.documents) {
          if (doc.$id !== addressId && doc.isDefault) {
            await updateDocument(collectionId, doc.$id, { isDefault: false });
          }
        }
      }

      const updated = await updateDocument(collectionId, addressId, updates);
      return res.status(200).json(updated);
    }

    // DELETE /api/addresses?addressId=xxx
    if (req.method === 'DELETE') {
      const { addressId } = req.query;
      if (!addressId) return res.status(400).json({ error: 'addressId required' });

      await deleteDocument(collectionId, addressId);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Addresses API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
