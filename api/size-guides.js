// Vercel Serverless Function: Size guide fetch via Appwrite API key
import { corsHeaders, getDocument, COLLECTION_IDS } from './_appwrite.js';

export default async function handler(req, res) {
  corsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

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
