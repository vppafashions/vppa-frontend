// Vercel Serverless Function: Stock check via Appwrite API key
import { corsHeaders, listDocuments, COLLECTION_IDS, Query } from './_appwrite.js';

export default async function handler(req, res) {
  corsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productIds } = req.body;
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ error: 'productIds array required' });
    }

    const results = [];
    for (const productId of productIds) {
      try {
        const data = await listDocuments(COLLECTION_IDS.products, [
          Query.equal('$id', productId),
          Query.limit(1),
        ]);

        if (data.documents.length > 0) {
          const product = data.documents[0];
          results.push({
            productId,
            inStock: product.inStock !== false,
            stockQuantity: product.stockQuantity ?? 999,
          });
        } else {
          // Product not found in Appwrite — likely hardcoded, treat as in-stock
          results.push({ productId, inStock: true, stockQuantity: 999 });
        }
      } catch {
        results.push({ productId, inStock: true, stockQuantity: 999 });
      }
    }

    return res.status(200).json({ results });
  } catch (error) {
    console.error('Stock API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
