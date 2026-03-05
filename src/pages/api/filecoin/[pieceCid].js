import { downloadJSONPayloadFromFilecoin } from '@/lib/filecoin/server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pieceCid } = req.query;

    if (!pieceCid || Array.isArray(pieceCid)) {
      return res.status(400).json({ error: 'pieceCid is required' });
    }

    const result = await downloadJSONPayloadFromFilecoin(pieceCid);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Filecoin download failed' });
  }
}
