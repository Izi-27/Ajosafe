import { uploadJSONPayloadToFilecoin } from '@/lib/filecoin/server';

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, payload } = req.body || {};

    if (!type || !payload) {
      return res.status(400).json({ error: 'type and payload are required' });
    }

    const result = await uploadJSONPayloadToFilecoin(type, payload);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Filecoin upload failed' });
  }
}
