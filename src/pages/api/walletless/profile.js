import {
  getWalletlessProfileByIssuer,
  resolveMagicIdentity,
  toWalletlessProfileResponse,
} from '@/lib/walletless/server';

function readDidToken(req) {
  const authorization = req.headers.authorization || '';
  if (!authorization.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice('Bearer '.length).trim();
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const didToken = readDidToken(req);
    const fallbackIssuer = req.query.issuer;
    const fallbackEmail = req.query.email;

    const identity = await resolveMagicIdentity({
      didToken,
      fallbackIssuer: Array.isArray(fallbackIssuer) ? fallbackIssuer[0] : fallbackIssuer,
      fallbackEmail: Array.isArray(fallbackEmail) ? fallbackEmail[0] : fallbackEmail,
    });

    const profile = await getWalletlessProfileByIssuer(identity.issuer);
    if (!profile) {
      return res.status(404).json({ error: 'Walletless profile not found' });
    }

    return res.status(200).json({
      profile: toWalletlessProfileResponse(profile, identity.tokenVerified),
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Failed to fetch walletless profile',
    });
  }
}
