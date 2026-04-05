// Vercel Serverless Function: Orders operations via Appwrite API key
import { corsHeaders, listDocuments, getDocument, createDocument, COLLECTION_IDS, Query } from './_appwrite.js';

export default async function handler(req, res) {
  corsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const collectionId = COLLECTION_IDS.orders;

  try {
    // GET /api/orders?userId=xxx — list user orders
    // GET /api/orders?orderId=xxx — get single order
    if (req.method === 'GET') {
      const { userId, orderId } = req.query;

      if (orderId) {
        const doc = await getDocument(collectionId, orderId);
        return res.status(200).json(doc);
      }

      if (!userId) return res.status(400).json({ error: 'userId or orderId required' });

      const data = await listDocuments(collectionId, [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt'),
        Query.limit(50),
      ]);
      return res.status(200).json(data);
    }

    // POST /api/orders — create order
    if (req.method === 'POST') {
      const { customerName, email, phone, address, items, total, status, notes, userId, razorpayPaymentId, razorpayOrderId } = req.body;

      if (!customerName || !email) return res.status(400).json({ error: 'customerName and email required' });

      const payload = {};
      if (customerName) payload.customerName = customerName;
      if (email) payload.email = email;
      if (phone) payload.phone = phone;
      if (address) payload.address = address;
      if (items) payload.items = items;
      if (total !== undefined) payload.total = total;
      if (status) payload.status = status;
      if (notes) payload.notes = notes;
      if (userId) payload.userId = userId;
      if (razorpayPaymentId) payload.razorpayPaymentId = razorpayPaymentId;
      if (razorpayOrderId) payload.razorpayOrderId = razorpayOrderId;

      const permissions = userId
        ? [`read("user:${userId}")`, `update("user:${userId}")`]
        : [];

      const doc = await createDocument(collectionId, 'unique()', payload, permissions);
      return res.status(201).json(doc);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Orders API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
