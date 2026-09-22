/* global process */
// Protected pricing export/import endpoint for the product catalog.
// Set PRICING_ADMIN_SECRET in the server environment before using this route.
import {
  corsHeaders,
  listDocuments,
  updateDocument,
  COLLECTION_IDS,
  Query,
} from './_appwrite.js';

const PRICING_ADMIN_SECRET = process.env.PRICING_ADMIN_SECRET || '';
const PAGE_SIZE = 100;
const MAX_PRODUCTS = 10000;

function getProvidedSecret(req) {
  const value = req.headers['x-pricing-admin-secret'];
  return Array.isArray(value) ? value[0] : value;
}

function authorize(req, res) {
  if (!PRICING_ADMIN_SECRET) {
    res.status(503).json({ error: 'Pricing management is not configured on the server.' });
    return false;
  }

  if (getProvidedSecret(req) !== PRICING_ADMIN_SECRET) {
    res.status(401).json({ error: 'Invalid pricing management secret.' });
    return false;
  }

  return true;
}

async function listAllProducts() {
  const documents = [];
  let offset = 0;

  while (offset < MAX_PRODUCTS) {
    const result = await listDocuments(COLLECTION_IDS.products, [
      Query.limit(PAGE_SIZE),
      Query.offset(offset),
    ]);
    const page = result.documents || [];
    documents.push(...page);

    if (page.length < PAGE_SIZE || (typeof result.total === 'number' && documents.length >= result.total)) break;
    offset += page.length;
  }

  return documents;
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toPricingRow(document) {
  return {
    productId: document.$id,
    itemCode: String(document.itemCode || '').trim(),
    productName: String(document.name || '').trim(),
    gender: formatGender(document.gender),
    collection: normalizeCollection(document.collectionSlug),
    sellingPrice: asNumber(document.price),
    mrp: asNumber(document.originalPrice ?? document.price),
  };
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parsePrice(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function normalizeCode(value) {
  return cleanText(value).toLowerCase();
}

function formatGender(value) {
  const gender = cleanText(value).toLowerCase();
  return gender ? `${gender.charAt(0).toUpperCase()}${gender.slice(1)}` : '';
}

function normalizeCollection(value) {
  return cleanText(value).replace(/_men$|_women$/i, '').toLowerCase();
}

async function handleGet(req, res) {
  const documents = await listAllProducts();
  const products = documents
    .map(toPricingRow)
    .sort((a, b) => a.itemCode.localeCompare(b.itemCode, undefined, { numeric: true, sensitivity: 'base' }));

  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.status(200).json({ products, total: products.length });
}

async function handlePost(req, res) {
  const updates = req.body?.updates;
  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ error: 'A non-empty updates array is required.' });
  }
  if (updates.length > MAX_PRODUCTS) {
    return res.status(400).json({ error: `A maximum of ${MAX_PRODUCTS} rows can be uploaded at once.` });
  }

  const documents = await listAllProducts();
  const byId = new Map(documents.map((document) => [document.$id, document]));
  const byItemCode = new Map();
  documents.forEach((document) => {
    const key = normalizeCode(document.itemCode);
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
    const productId = cleanText(update?.productId);
    const itemCode = cleanText(update?.itemCode);
    const sellingPrice = parsePrice(update?.sellingPrice);
    const mrp = parsePrice(update?.mrp);
    const lookupKey = productId ? `id:${productId}` : `code:${normalizeCode(itemCode)}`;
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
      const matches = byItemCode.get(normalizeCode(itemCode)) || [];
      if (matches.length > 1) rowErrors.push('Item Code matches more than one product.');
      if (matches.length === 1) document = matches[0];
    }

    if (!document) rowErrors.push('No product matched this Product ID or Item Code.');
    if (document && productId && itemCode && normalizeCode(document.itemCode) !== normalizeCode(itemCode)) {
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
    return res.status(400).json({ error: 'No prices were updated. Fix the CSV and upload it again.', details: errors });
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

export default async function handler(req, res) {
  corsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!authorize(req, res)) return;

  try {
    if (req.method === 'GET') return await handleGet(req, res);
    if (req.method === 'POST') return await handlePost(req, res);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Pricing API error:', error);
    return res.status(500).json({ error: error.message || 'Pricing management failed.' });
  }
}
