// Vercel Serverless Function: Inventory + reviews + size guides
// Merged into a single function to stay within the Vercel Hobby 12-function limit.
// Usage:
//   POST /api/inventory?action=stock
//   GET  /api/inventory?action=size-guide&id=xxx
//   GET  /api/inventory?action=reviews&productId=xxx[&summary=1]
//   POST /api/inventory?action=reviews
//   POST /api/inventory?action=reviews&setup=1   (admin-only)
//   DELETE /api/inventory?action=reviews         (admin-only)
//   GET  /api/inventory?action=pricing            (admin-only)
//   POST /api/inventory?action=pricing            (admin-only)

import {
  corsHeaders,
  listDocuments,
  getDocument,
  createDocument,
  deleteDocument,
  updateDocument,
  COLLECTION_IDS,
  Query,
} from './_appwrite.js';

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '69aaa3a900228aff9ae5';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || '69aaa3c3001805a8a9ef';
const REVIEWS_ADMIN_SECRET = process.env.REVIEWS_ADMIN_SECRET || APPWRITE_API_KEY;
const PRICING_ADMIN_SECRET = process.env.PRICING_ADMIN_SECRET || '';
const PRICING_PAGE_SIZE = 100;
const PRICING_MAX_PRODUCTS = 10000;

function parseVariantInventory(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch { /* ignore */ }
  return [];
}

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

  const action = req.query.action;

  if (action === 'stock') {
    return handleStock(req, res);
  } else if (action === 'size-guide') {
    return handleSizeGuide(req, res);
  } else if (action === 'pricing') {
    return handlePricing(req, res);
  } else if (action === 'reviews') {
    return handleReviews(req, res);
  } else {
    return res.status(400).json({ error: 'Invalid action. Use ?action=stock | size-guide | pricing | reviews' });
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

// ----- Pricing CSV -----

function pricingProvidedSecret(req) {
  const value = req.headers['x-pricing-admin-secret'];
  return Array.isArray(value) ? value[0] : value;
}

function authorizePricing(req, res) {
  if (!PRICING_ADMIN_SECRET) {
    res.status(503).json({ error: 'Pricing management is not configured on the server.' });
    return false;
  }

  if (pricingProvidedSecret(req) !== PRICING_ADMIN_SECRET) {
    res.status(401).json({ error: 'Invalid pricing management secret.' });
    return false;
  }

  return true;
}

async function listAllPricingProducts() {
  const documents = [];
  let offset = 0;

  while (offset < PRICING_MAX_PRODUCTS) {
    const result = await listDocuments(COLLECTION_IDS.products, [
      Query.limit(PRICING_PAGE_SIZE),
      Query.offset(offset),
    ]);
    const page = result.documents || [];
    documents.push(...page);

    if (page.length < PRICING_PAGE_SIZE || (typeof result.total === 'number' && documents.length >= result.total)) {
      break;
    }
    offset += page.length;
  }

  return documents;
}

function pricingNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function pricingText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function pricingCode(value) {
  return pricingText(value).toLowerCase();
}

function pricingGender(value) {
  const gender = pricingText(value).toLowerCase();
  return gender ? `${gender.charAt(0).toUpperCase()}${gender.slice(1)}` : '';
}

function pricingCollection(value) {
  return pricingText(value).replace(/_men$|_women$/i, '').toLowerCase();
}

function pricingRow(document) {
  return {
    productId: document.$id,
    itemCode: pricingText(document.itemCode),
    productName: pricingText(document.name),
    gender: pricingGender(document.gender),
    collection: pricingCollection(document.collectionSlug),
    sellingPrice: pricingNumber(document.price),
    mrp: pricingNumber(document.originalPrice ?? document.price),
  };
}

function pricingPrice(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

async function handlePricing(req, res) {
  if (!authorizePricing(req, res)) return;

  try {
    if (req.method === 'GET') {
      const documents = await listAllPricingProducts();
      const products = documents
        .map(pricingRow)
        .sort((a, b) => a.itemCode.localeCompare(b.itemCode, undefined, { numeric: true, sensitivity: 'base' }));

      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(200).json({ products, total: products.length });
    }

    if (req.method === 'POST') {
      const updates = req.body?.updates;
      if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({ error: 'A non-empty updates array is required.' });
      }
      if (updates.length > PRICING_MAX_PRODUCTS) {
        return res.status(400).json({ error: `A maximum of ${PRICING_MAX_PRODUCTS} rows can be uploaded at once.` });
      }

      const documents = await listAllPricingProducts();
      const byId = new Map(documents.map((document) => [document.$id, document]));
      const byItemCode = new Map();
      documents.forEach((document) => {
        const key = pricingCode(document.itemCode);
        if (!key) return;
        const matches = byItemCode.get(key) || [];
        matches.push(document);
        byItemCode.set(key, matches);
      });

      const errors = [];
      const seen = new Set();
      const resolvedIds = new Set();
      const resolvedUpdates = [];

      updates.forEach((update, index) => {
        const rowNumber = index + 2;
        const productId = pricingText(update?.productId);
        const itemCode = pricingText(update?.itemCode);
        const sellingPrice = pricingPrice(update?.sellingPrice);
        const mrp = pricingPrice(update?.mrp);
        const lookupKey = productId ? `id:${productId}` : `code:${pricingCode(itemCode)}`;
        const rowErrors = [];

        if (!productId && !itemCode) rowErrors.push('Product ID or Item Code is required.');
        if (sellingPrice === null) rowErrors.push('Selling Price must be a non-negative number.');
        if (mrp === null) rowErrors.push('MRP must be a non-negative number.');
        if (sellingPrice !== null && mrp !== null && sellingPrice > mrp) {
          rowErrors.push('Selling Price cannot be greater than MRP.');
        }
        if (seen.has(lookupKey)) rowErrors.push('The same product appears more than once.');
        seen.add(lookupKey);

        let document = productId ? byId.get(productId) : undefined;
        if (!document && itemCode) {
          const matches = byItemCode.get(pricingCode(itemCode)) || [];
          if (matches.length > 1) rowErrors.push('Item Code matches more than one product.');
          if (matches.length === 1) document = matches[0];
        }

        if (!document) rowErrors.push('No product matched this Product ID or Item Code.');
        if (document && productId && itemCode && pricingCode(document.itemCode) !== pricingCode(itemCode)) {
          rowErrors.push('Product ID and Item Code refer to different products.');
        }
        if (document && resolvedIds.has(document.$id)) rowErrors.push('The same product appears more than once.');

        if (rowErrors.length > 0) {
          errors.push(`Row ${rowNumber}: ${rowErrors.join(' ')}`);
          return;
        }

        resolvedIds.add(document.$id);
        resolvedUpdates.push({ document, sellingPrice, mrp });
      });

      if (errors.length > 0) {
        return res.status(400).json({
          error: 'No prices were updated. Fix the CSV and upload it again.',
          details: errors,
        });
      }

      let updatedCount = 0;
      for (const update of resolvedUpdates) {
        await updateDocument(COLLECTION_IDS.products, update.document.$id, {
          price: update.sellingPrice,
          originalPrice: update.mrp,
        });
        updatedCount += 1;
      }

      return res.status(200).json({ success: true, updatedCount });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Pricing API error:', error);
    return res.status(500).json({ error: error.message || 'Pricing management failed.' });
  }
}

// ----- Reviews -----

function appwriteHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': APPWRITE_PROJECT_ID,
    'X-Appwrite-Key': APPWRITE_API_KEY,
  };
}

async function appwriteCall(method, path, body) {
  const r = await fetch(`${APPWRITE_ENDPOINT}${path}`, {
    method,
    headers: appwriteHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let parsed = {};
  try { parsed = text ? JSON.parse(text) : {}; } catch { parsed = { raw: text }; }
  return { ok: r.ok, status: r.status, body: parsed };
}

async function setupReviewsCollection() {
  const COLLECTION_ID = COLLECTION_IDS.reviews;
  const log = [];

  const got = await appwriteCall('GET', `/databases/${DATABASE_ID}/collections/${COLLECTION_ID}`);
  if (!got.ok) {
    const created = await appwriteCall('POST', `/databases/${DATABASE_ID}/collections`, {
      collectionId: COLLECTION_ID,
      name: 'Reviews',
      permissions: ['read("any")'],
      documentSecurity: false,
    });
    if (!created.ok) throw new Error(`create collection failed: ${created.status} ${JSON.stringify(created.body)}`);
    log.push('collection: created');
  } else {
    log.push('collection: exists');
  }

  const attrs = [
    ['string', { key: 'productId', size: 64, required: true }],
    ['integer', { key: 'rating', min: 1, max: 5, required: true }],
    ['string', { key: 'title', size: 200, required: true }],
    ['string', { key: 'comment', size: 3000, required: true }],
    ['string', { key: 'authorName', size: 120, required: true }],
    ['string', { key: 'authorEmail', size: 200, required: true }],
    ['string', { key: 'photoUrl', size: 600, required: false, default: '' }],
    ['boolean', { key: 'approved', required: false, default: true }],
  ];
  for (const [type, body] of attrs) {
    const r = await appwriteCall('POST', `/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/attributes/${type}`, body);
    if (!r.ok && r.status !== 409) throw new Error(`attr ${body.key} failed: ${r.status} ${JSON.stringify(r.body)}`);
    log.push(`attr ${body.key}: ${r.status === 409 ? 'exists' : 'created'}`);
  }

  for (const idx of [
    { key: 'idx_product', type: 'key', attributes: ['productId'], orders: ['ASC'] },
    { key: 'idx_approved', type: 'key', attributes: ['approved'], orders: ['ASC'] },
  ]) {
    try {
      const r = await appwriteCall('POST', `/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/indexes`, idx);
      log.push(`${idx.key}: ${r.ok ? 'created' : (r.status === 409 ? 'exists' : `skipped ${r.status}`)}`);
    } catch (e) {
      log.push(`${idx.key}: skipped (${e.message})`);
    }
  }

  return log;
}

async function handleReviews(req, res) {
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
        if (/not found|404/i.test(err.message)) {
          return res.status(200).json(
            summary ? { avg: 0, count: 0, distribution: [0, 0, 0, 0, 0] } : { documents: [], total: 0 },
          );
        }
        throw err;
      }

      const docs = data.documents || [];
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
      if (req.query && req.query.setup) {
        const provided = req.headers['x-admin-secret'];
        if (!REVIEWS_ADMIN_SECRET || provided !== REVIEWS_ADMIN_SECRET) {
          return res.status(401).json({ error: 'unauthorized' });
        }
        const log = await setupReviewsCollection();
        return res.status(200).json({ success: true, log });
      }

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
      if (!REVIEWS_ADMIN_SECRET || provided !== REVIEWS_ADMIN_SECRET) {
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
