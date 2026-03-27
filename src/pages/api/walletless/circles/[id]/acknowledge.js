import {
  getCircleById,
  normalizeCircleMemberAddress,
  parseCircleStatus,
  sendSponsoredAcknowledge,
} from '@/lib/flow/sponsored';
import {
  getWalletlessProfileByIssuer,
  resolveMagicIdentity,
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
    if (!didToken) {
      return res.status(401).json({ error: 'Missing Magic session token.' });
    }

    const identity = await resolveMagicIdentity({ didToken });
    if (!identity.tokenVerified) {
      return res.status(401).json({ error: 'Magic session verification failed.' });
    }

    const profile = await getWalletlessProfileByIssuer(identity.issuer);
    if (!profile?.managed_flow_address) {
      return res.status(404).json({ error: 'Walletless profile not found for this user.' });
    }

    const circleId = Number(req.query.id);
    if (!Number.isInteger(circleId) || circleId <= 0) {
      return res.status(400).json({ error: 'Invalid circle id.' });
    }

    const circle = await getCircleById(circleId);
    if (!circle) {
      return res.status(404).json({ error: 'Circle not found.' });
    }

    const status = parseCircleStatus(circle.status);
    if (status !== 4) {
      return res.status(400).json({ error: 'Circle is no longer pending acknowledgement.' });
    }

    const members = Object.values(circle.members || {});
    const managedAddress = normalizeCircleMemberAddress(profile.managed_flow_address);
    const member = members.find(
      (entry) => normalizeCircleMemberAddress(entry?.address) === managedAddress
    );

    if (!member) {
      return res.status(403).json({ error: 'You are not a listed member of this circle.' });
    }

    if (member.depositPaid) {
      return res.status(200).json({
        ok: true,
        alreadyAcknowledged: true,
        message: 'Agreement already acknowledged.',
      });
    }

    const result = await sendSponsoredAcknowledge({
      circleId,
      memberAddress: managedAddress,
    });

    return res.status(200).json({
      ok: true,
      transactionId: result.transactionId,
      mode: 'sponsored',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Walletless acknowledge failed.' });
  }
}
