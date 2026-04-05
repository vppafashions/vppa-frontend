// Vercel Serverless Function: Customer operations via Appwrite API key
import { corsHeaders, listDocuments, createDocument, updateDocument, COLLECTION_IDS } from './_appwrite.js';

export default async function handler(req, res) {
  corsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const collectionId = COLLECTION_IDS.customers;

  try {
    // GET /api/customers?userId=xxx — get customer by userId
    if (req.method === 'GET') {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: 'userId required' });

      const data = await listDocuments(collectionId, [
        `equal("userId", ["${userId}"])`,
        'limit(1)',
      ]);
      if (data.documents.length > 0) {
        return res.status(200).json(data.documents[0]);
      }
      return res.status(404).json({ error: 'Customer not found' });
    }

    // POST /api/customers — create or update customer
    if (req.method === 'POST') {
      const {
        userId, firstName, lastName, email, phone,
        billingAddress, billingCity, billingState, billingPincode, billingCountry,
        shippingAddress, shippingCity, shippingState, shippingPincode, shippingCountry,
        gstin, companyName, landmark, alternatePhone, sameAsShipping,
      } = req.body;

      if (!userId) return res.status(400).json({ error: 'userId required' });

      const payload = {
        userId, firstName, lastName, email, phone,
        billingAddress, billingCity, billingState, billingPincode,
        billingCountry: billingCountry || 'India',
        shippingAddress, shippingCity, shippingState, shippingPincode,
        shippingCountry: shippingCountry || 'India',
        sameAsShipping: sameAsShipping ?? true,
      };
      // Only include optional fields if they have values
      if (gstin) payload.gstin = gstin;
      if (companyName) payload.companyName = companyName;
      if (landmark) payload.landmark = landmark;
      if (alternatePhone) payload.alternatePhone = alternatePhone;

      // Check if customer exists
      const existing = await listDocuments(collectionId, [
        `equal("userId", ["${userId}"])`,
        'limit(1)',
      ]);

      if (existing.documents.length > 0) {
        const docId = existing.documents[0].$id;
        const updatePayload = { ...payload };
        delete updatePayload.userId; // can't update userId
        const updated = await updateDocument(collectionId, docId, updatePayload);
        return res.status(200).json(updated);
      }

      const doc = await createDocument(collectionId, 'unique()', payload, [
        `read("user:${userId}")`,
        `update("user:${userId}")`,
        `delete("user:${userId}")`,
      ]);
      return res.status(201).json(doc);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Customers API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
