// Vercel Serverless Function: Stock check via Appwrite API key
import { corsHeaders, listDocuments, COLLECTION_IDS, Query } from './_appwrite.js';

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
      const variant = variants?.[i]; // { size, color } or undefined
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
