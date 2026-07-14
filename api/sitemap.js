// Vercel Serverless Function: Dynamic sitemap.xml generator
// Fetches all products from Appwrite and generates a sitemap automatically
import { listDocuments, COLLECTION_IDS, Query } from './_appwrite.js';

const SITE_URL = 'https://vppafashions.com';

// Static pages with their change frequency and priority
const STATIC_PAGES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/collection/velocity', changefreq: 'weekly', priority: '0.8' },
  { path: '/collection/presence', changefreq: 'weekly', priority: '0.8' },
  { path: '/collection/power', changefreq: 'weekly', priority: '0.8' },
  { path: '/collection/attitude', changefreq: 'weekly', priority: '0.8' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
  { path: '/shipping-returns', changefreq: 'monthly', priority: '0.5' },
  { path: '/faq', changefreq: 'monthly', priority: '0.5' },
];

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toW3CDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString().split('T')[0];
  } catch {
    return undefined;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end('Method not allowed');
  }

  try {
    // Fetch all products from Appwrite
    let allProducts = [];
    let offset = 0;
    const batchSize = 100;
    let hasMore = true;

    while (hasMore) {
      const queries = [
        Query.limit(batchSize),
        Query.orderDesc('$createdAt'),
      ];
      if (offset > 0) {
        // Appwrite REST API uses offset via cursor, but simplest is limit+offset
        // For the REST API we need to add an offset query
        queries.push(JSON.stringify({ method: 'offset', values: [offset] }));
      }

      const result = await listDocuments(COLLECTION_IDS.products, queries);
      allProducts = allProducts.concat(result.documents);

      if (result.documents.length < batchSize) {
        hasMore = false;
      } else {
        offset += batchSize;
      }
    }

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Static pages
    for (const page of STATIC_PAGES) {
      xml += '  <url>\n';
      xml += `    <loc>${SITE_URL}${page.path}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    }

    // Dynamic product pages
    for (const product of allProducts) {
      // Skip products hidden from the storefront so search engines don't index them
      if (product.displayOnCollectionPage === false) continue;
      const productSlug = product.slug || product.$id;
      const lastmod = toW3CDate(product.$updatedAt || product.$createdAt);

      xml += '  <url>\n';
      xml += `    <loc>${SITE_URL}/product/${escapeXml(productSlug)}</loc>\n`;
      if (lastmod) {
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
      }
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    }

    xml += '</urlset>\n';

    // Set headers for XML response with caching (revalidate every 1 hour)
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);

    // Fallback: return static pages only
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    for (const page of STATIC_PAGES) {
      xml += '  <url>\n';
      xml += `    <loc>${SITE_URL}${page.path}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    }
    xml += '</urlset>\n';

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).send(xml);
  }
}
