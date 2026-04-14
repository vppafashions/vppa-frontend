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
        return res.status(200).json({ product: transformProduct(doc) });
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
        return res.status(200).json({ product: transformProduct(result.documents[0]) });
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
      // Appwrite stores: velocity_men, presence_men, power_men, attitude_men, velocity_women, etc.
      const base = collection.replace(/_men$|_women$/, '');
      const suffix = gender === 'women' ? '_women' : '_men';
      const withSuffix = `${base}${suffix}`;
      queries.push(Query.equal('collectionSlug', [base, withSuffix]));
    }

    // When no collection but gender is specified, filter all products by gender suffix
    if (!collection && gender) {
      const suffix = gender === 'women' ? '_women' : '_men';
      queries.push(Query.contains('collectionSlug', suffix));
    }

    if (featured === 'true') {
      queries.push(Query.equal('featured', true));
    }

    const result = await listDocuments(COLLECTION_IDS.products, queries);

    const products = result.documents
      .filter((doc) => doc.displayOnCollectionPage !== false)
      .map(transformProduct);

    // Set cache headers — revalidate every 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ products, total: products.length });
  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

function transformProduct(doc) {
  // Parse JSON string fields
  let images = [];
  try {
    images = doc.images ? JSON.parse(doc.images) : [];
  } catch {
    images = [];
  }

  let colorImages = {};
  try {
    colorImages = doc.colorImages ? JSON.parse(doc.colorImages) : {};
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
    fabricCare: doc.fabricCare2 || doc.fabricCare || '',
    returnPolicy: doc.returnPolicy || '',
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
