import {
  bootstrapWalletlessProfile,
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
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const didToken = readDidToken(req);
    const { issuer, email } = req.body || {};

    const identity = await resolveMagicIdentity({
      didToken,
      fallbackIssuer: issuer,
      fallbackEmail: email,
    });

    const profile = await bootstrapWalletlessProfile({
      issuer: identity.issuer,
      email: identity.email,
    });

    return res.status(200).json({
      profile: toWalletlessProfileResponse(profile, identity.tokenVerified),
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Failed to bootstrap walletless profile',
    });
  }
}
