// Vercel Serverless Function: Fetch products from Appwrite
import { corsHeaders, listDocuments, getDocument, COLLECTION_IDS, Query } from './_appwrite.js';

export default async function handler(req, res) {
  corsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, slug, collection, featured, limit: limitParam, gender } = req.query;

    // Single product by ID
    if (id) {
      try {
        const doc = await getDocument(COLLECTION_IDS.products, id);
        const extras = await fetchExtras(id);
        return res.status(200).json({ product: transformProduct(doc, extras) });
      } catch {
        return res.status(404).json({ error: 'Product not found' });
      }
    }

    // Single product by slug
    if (slug) {
      try {
        const result = await listDocuments(COLLECTION_IDS.products, [
          Query.equal('slug', slug),
          Query.limit(1),
        ]);
        if (result.documents.length === 0) {
          return res.status(404).json({ error: 'Product not found' });
        }
        const doc = result.documents[0];
        // Hidden products 404 on direct deep links too (consistent with sitemap exclusion)
        if (doc.displayOnCollectionPage === false) {
          return res.status(404).json({ error: 'Product not found' });
        }
        const extras = await fetchExtras(doc.$id);
        return res.status(200).json({ product: transformProduct(doc, extras) });
      } catch {
        return res.status(404).json({ error: 'Product not found' });
      }
    }

    // Build queries
    const queries = [];
    const fetchLimit = limitParam ? parseInt(limitParam, 10) : 100;
    queries.push(Query.limit(fetchLimit));
    queries.push(Query.orderDesc('$createdAt'));

    if (collection) {
      // Frontend uses: velocity, presence, power, attitude
      // Appwrite stores either bare ('velocity') or suffixed ('velocity_men', 'velocity_women')
      const base = collection.replace(/_men$|_women$/, '');
      const suffix = gender === 'women' ? '_women' : '_men';
      const withSuffix = `${base}${suffix}`;
      queries.push(Query.equal('collectionSlug', [base, withSuffix]));
    }

    if (gender) {
      // Match the actual `gender` field on the product (stored as 'Men' / 'Women').
      // Accept either case from the URL param for safety.
      const g = String(gender).toLowerCase();
      const variants = g === 'women'
        ? ['Women', 'women', 'WOMEN']
        : ['Men', 'men', 'MEN'];
      queries.push(Query.equal('gender', variants));
    }

    if (featured === 'true') {
      queries.push(Query.equal('featured', true));
    }

    const result = await listDocuments(COLLECTION_IDS.products, queries);

    // Batch-fetch extras for all products
    const extrasMap = await fetchExtrasForMany(result.documents.map((d) => d.$id));

    const products = result.documents
      .filter((doc) => doc.displayOnCollectionPage !== false)
      .map((doc) => transformProduct(doc, extrasMap[doc.$id]));

    // Set cache headers — revalidate every 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ products, total: products.length });
  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

// Fetch extras for a single product (returns {} on failure)
async function fetchExtras(productId) {
  try {
    return await getDocument(COLLECTION_IDS.productExtras, productId);
  } catch {
    return {};
  }
}

// Batch-fetch extras for multiple products
async function fetchExtrasForMany(productIds) {
  const map = {};
  const results = await Promise.allSettled(
    productIds.map((id) =>
      getDocument(COLLECTION_IDS.productExtras, id).then((doc) => ({ id, doc }))
    )
  );
  for (const r of results) {
    if (r.status === 'fulfilled') {
      map[r.value.id] = r.value.doc;
    }
  }
  return map;
}

function transformProduct(doc, extras = {}) {
  // Parse JSON string fields
  let images = [];
  try {
    images = doc.images ? JSON.parse(doc.images) : [];
  } catch {
    images = [];
  }

  // colorImages comes from productExtras collection
  let colorImages = {};
  try {
    colorImages = extras.colorImages ? JSON.parse(extras.colorImages) : {};
  } catch {
    colorImages = {};
  }

  let variantInventory = [];
  try {
    variantInventory = doc.variantInventory ? JSON.parse(doc.variantInventory) : [];
  } catch {
    variantInventory = [];
  }

  // Parse comma-separated strings into arrays
  const sizes = doc.sizes ? doc.sizes.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const colors = doc.colors ? doc.colors.split(',').map((c) => c.trim()).filter(Boolean) : [];

  // Map Appwrite collection slug to frontend slug
  // Appwrite uses: velocity_men, presence_men, power_men, attitude_men
  // Frontend uses: velocity, presence, power, attitude
  const collectionSlug = doc.collectionSlug
    ? doc.collectionSlug.replace(/_men$|_women$/, '')
    : '';

  // fabricCare & returnPolicy come from productExtras (with fallback to products collection)
  const fabricCare = extras.fabricCare || doc.fabricCare2 || '';
  const returnPolicy = extras.returnPolicy || doc.returnPolicy || '';

  return {
    id: doc.$id,
    name: doc.name || '',
    price: doc.price || 0,
    originalPrice: doc.originalPrice || doc.price || 0,
    description: doc.description || '',
    images,
    sizes,
    colors,
    collectionSlug,
    category: doc.category || doc.productType || '',
    productType: doc.productType || '',
    sku: doc.sku || '',
    fabricCare,
    returnPolicy,
    colorImages: typeof colorImages === 'object' && !Array.isArray(colorImages) ? colorImages : {},
    sizeGuideId: doc.sizeGuideId || '',
    slug: doc.slug || '',
    inStock: doc.inStock !== false,
    stockQuantity: doc.stockQuantity || 0,
    variantInventory,
    featured: doc.featured || false,
    displayOnMainPage: doc.displayOnMainPage || false,
    gender: doc.gender || '',
    itemCode: doc.itemCode || '',
    hsnCode: doc.hsnCode || '',
    createdAt: doc.$createdAt,
    updatedAt: doc.$updatedAt,
  };
}
