// Vercel Serverless Function: Inventory operations (stock check + size guides)
// Merged from stock.js and size-guides.js to stay within Vercel Hobby 12-function limit
// Usage: POST /api/inventory?action=stock | GET /api/inventory?action=size-guide&id=xxx

import { corsHeaders, listDocuments, getDocument, COLLECTION_IDS, Query } from './_appwrite.js';

function parseVariantInventory(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch { /* ignore */ }
  return [];
}

export default async function handler(req, res) {
  corsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action;

  if (action === 'stock') {
    return handleStock(req, res);
  } else if (action === 'size-guide') {
    return handleSizeGuide(req, res);
  } else {
    return res.status(400).json({ error: 'Invalid action. Use ?action=stock or ?action=size-guide' });
  }
}

async function handleStock(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productIds, variants } = req.body;
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ error: 'productIds array required' });
    }

    const results = [];
    for (let i = 0; i < productIds.length; i++) {
      const productId = productIds[i];
      const variant = variants?.[i];
      try {
        const data = await listDocuments(COLLECTION_IDS.products, [
          Query.equal('$id', productId),
          Query.limit(1),
        ]);

        if (data.documents.length > 0) {
          const product = data.documents[0];
          const variantInv = parseVariantInventory(product.variantInventory);

          if (variant && variant.size && variant.color && variantInv.length > 0) {
            const match = variantInv.find(
              (v) => v.size.toLowerCase() === variant.size.toLowerCase() &&
                     v.color.toLowerCase() === variant.color.toLowerCase()
            );
            const variantStock = match ? match.stock : 0;
            results.push({
              productId,
              inStock: variantStock > 0,
              stockQuantity: variantStock,
              variantInventory: variantInv,
            });
          } else {
            results.push({
              productId,
              inStock: product.inStock !== false,
              stockQuantity: product.stockQuantity ?? 999,
              variantInventory: variantInv,
            });
          }
        } else {
          results.push({ productId, inStock: true, stockQuantity: 999, variantInventory: [] });
        }
      } catch {
        results.push({ productId, inStock: true, stockQuantity: 999, variantInventory: [] });
      }
    }

    return res.status(200).json({ results });
  } catch (error) {
    console.error('Stock API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function handleSizeGuide(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'id query parameter required' });
    }

    const doc = await getDocument(COLLECTION_IDS.sizeGuides, id);
    return res.status(200).json(doc);
  } catch (error) {
    console.error('Size guide API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
