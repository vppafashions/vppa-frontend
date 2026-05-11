// One-off admin endpoint that creates the `reviews` collection in Appwrite
// with all attributes + indexes. Safe to call multiple times (idempotent).
//
// Usage:
//   curl -X POST 'https://vppafashions.com/api/setup-reviews-collection' \
//        -H 'X-Admin-Secret: <APPWRITE_API_KEY>'
//
// Auth: requires REVIEWS_ADMIN_SECRET (falls back to APPWRITE_API_KEY) in header.

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '69aaa3a900228aff9ae5';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || '69aaa3c3001805a8a9ef';
const COLLECTION_ID = 'reviews';
const ADMIN_SECRET = process.env.REVIEWS_ADMIN_SECRET || APPWRITE_API_KEY;

function headers() {
  return {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': APPWRITE_PROJECT_ID,
    'X-Appwrite-Key': APPWRITE_API_KEY,
  };
}

async function apiCall(method, path, body) {
  const res = await fetch(`${APPWRITE_ENDPOINT}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed = {};
  try { parsed = text ? JSON.parse(text) : {}; } catch { parsed = { raw: text }; }
  return { ok: res.ok, status: res.status, body: parsed };
}

async function ensureCollection() {
  const got = await apiCall('GET', `/databases/${DATABASE_ID}/collections/${COLLECTION_ID}`);
  if (got.ok) return { created: false };
  const created = await apiCall('POST', `/databases/${DATABASE_ID}/collections`, {
    collectionId: COLLECTION_ID,
    name: 'Reviews',
    permissions: ['read("any")'],
    documentSecurity: false,
  });
  if (!created.ok) throw new Error(`create collection failed: ${created.status} ${JSON.stringify(created.body)}`);
  return { created: true };
}

async function ensureStringAttr(key, size, required, defaultVal) {
  const res = await apiCall('POST', `/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/attributes/string`, {
    key, size, required, default: required ? null : (defaultVal ?? null),
  });
  // Already exists -> 409. That's fine.
  if (res.ok || res.status === 409) return { ok: true, status: res.status };
  throw new Error(`attr ${key} failed: ${res.status} ${JSON.stringify(res.body)}`);
}

async function ensureIntegerAttr(key, min, max, required, defaultVal) {
  const res = await apiCall('POST', `/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/attributes/integer`, {
    key, min, max, required, default: required ? null : (defaultVal ?? null),
  });
  if (res.ok || res.status === 409) return { ok: true, status: res.status };
  throw new Error(`attr ${key} failed: ${res.status} ${JSON.stringify(res.body)}`);
}

async function ensureBooleanAttr(key, required, defaultVal) {
  const res = await apiCall('POST', `/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/attributes/boolean`, {
    key, required, default: required ? null : (defaultVal ?? null),
  });
  if (res.ok || res.status === 409) return { ok: true, status: res.status };
  throw new Error(`attr ${key} failed: ${res.status} ${JSON.stringify(res.body)}`);
}

async function ensureIndex(key, type, attributes, orders) {
  const res = await apiCall('POST', `/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/indexes`, {
    key, type, attributes, orders: orders || attributes.map(() => 'ASC'),
  });
  if (res.ok || res.status === 409) return { ok: true, status: res.status };
  throw new Error(`index ${key} failed: ${res.status} ${JSON.stringify(res.body)}`);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const provided = req.headers['x-admin-secret'];
  if (!ADMIN_SECRET || provided !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  try {
    const log = [];
    const c = await ensureCollection();
    log.push(`collection: ${c.created ? 'created' : 'exists'}`);

    await ensureStringAttr('productId', 64, true);                log.push('attr productId');
    await ensureIntegerAttr('rating', 1, 5, true);                log.push('attr rating');
    await ensureStringAttr('title', 200, true);                   log.push('attr title');
    await ensureStringAttr('comment', 3000, true);                log.push('attr comment');
    await ensureStringAttr('authorName', 120, true);              log.push('attr authorName');
    await ensureStringAttr('authorEmail', 200, true);             log.push('attr authorEmail');
    await ensureStringAttr('photoUrl', 600, false, '');           log.push('attr photoUrl');
    await ensureBooleanAttr('approved', false, true);             log.push('attr approved');

    // Indexes need attributes to finish provisioning. Best-effort, ignore failures.
    try { await ensureIndex('idx_product', 'key', ['productId']); log.push('idx_product'); } catch (e) { log.push(`idx_product skipped: ${e.message}`); }
    try { await ensureIndex('idx_approved', 'key', ['approved']); log.push('idx_approved'); } catch (e) { log.push(`idx_approved skipped: ${e.message}`); }

    return res.status(200).json({ success: true, log });
  } catch (error) {
    console.error('setup-reviews-collection error:', error);
    return res.status(500).json({ error: error.message });
  }
}
