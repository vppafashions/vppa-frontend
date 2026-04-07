// Shared Appwrite server-side client using API key (not client SDK)
// Used by all Vercel serverless functions to bypass client-side rate limits

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '69aaa3a900228aff9ae5';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || '69aaa3c3001805a8a9ef';

const COLLECTION_IDS = {
  carts: 'carts',
  orders: 'orders',
  customers: 'customers',
  wishlists: 'wishlists',
  products: 'products',
  addresses: 'addresses',
  sizeGuides: 'size-guides',
  returns: 'returns',
};

function headers() {
  return {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': APPWRITE_PROJECT_ID,
    'X-Appwrite-Key': APPWRITE_API_KEY,
  };
}

// Query builder for Appwrite REST API (JSON format)
const Query = {
  equal: (attribute, values) => JSON.stringify({ method: 'equal', attribute, values: Array.isArray(values) ? values : [values] }),
  notEqual: (attribute, values) => JSON.stringify({ method: 'notEqual', attribute, values: Array.isArray(values) ? values : [values] }),
  limit: (value) => JSON.stringify({ method: 'limit', values: [value] }),
  orderDesc: (attribute) => JSON.stringify({ method: 'orderDesc', attribute, values: [] }),
  orderAsc: (attribute) => JSON.stringify({ method: 'orderAsc', attribute, values: [] }),
};

function corsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function listDocuments(collectionId, queries = []) {
  const params = new URLSearchParams();
  queries.forEach((q) => params.append('queries[]', q));

  const url = `${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${collectionId}/documents?${params.toString()}`;
  const response = await fetch(url, { headers: headers() });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Appwrite error ${response.status}`);
  }
  return response.json();
}

async function getDocument(collectionId, documentId) {
  const url = `${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${collectionId}/documents/${documentId}`;
  const response = await fetch(url, { headers: headers() });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Appwrite error ${response.status}`);
  }
  return response.json();
}

async function createDocument(collectionId, documentId, data, permissions = []) {
  const url = `${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${collectionId}/documents`;
  const response = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      documentId,
      data,
      permissions,
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Appwrite error ${response.status}`);
  }
  return response.json();
}

async function updateDocument(collectionId, documentId, data) {
  const url = `${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${collectionId}/documents/${documentId}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ data }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Appwrite error ${response.status}`);
  }
  return response.json();
}

async function deleteDocument(collectionId, documentId) {
  const url = `${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${collectionId}/documents/${documentId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Appwrite error ${response.status}`);
  }
  return true;
}

export {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_API_KEY,
  DATABASE_ID,
  COLLECTION_IDS,
  Query,
  corsHeaders,
  listDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
};
