import {
  getCircleById,
  normalizeCircleMemberAddress,
  parseCircleStatus,
  sendSponsoredContribution,
} from '@/lib/flow/sponsored';
import {
  getWalletlessProfileByIssuer,
  resolveMagicIdentity,
} from '@/lib/walletless/server';

const inFlightContributionRequests = new Set();

function readDidToken(req) {
  const authorization = req.headers.authorization || '';
  if (!authorization.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice('Bearer '.length).trim();
}

function normalizeFlowTimestamp(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    return value;
  }

  const parsed = parseFloat(String(value));
  return Number.isNaN(parsed) ? null : parsed;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let inFlightKey = null;

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

    const round = Number(req.body?.round);
    const amount = Number(req.body?.amount);
    if (!Number.isInteger(round) || round <= 0) {
      return res.status(400).json({ error: 'A valid round number is required.' });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'A valid amount is required.' });
    }

    const circle = await getCircleById(circleId);
    if (!circle) {
      return res.status(404).json({ error: 'Circle not found.' });
    }

    const status = parseCircleStatus(circle.status);
    if (status !== 0) {
      return res.status(400).json({ error: 'Circle is not active for contributions.' });
    }

    const members = Object.values(circle.members || {});
    const managedAddress = normalizeCircleMemberAddress(profile.managed_flow_address);
    const member = members.find(
      (entry) => normalizeCircleMemberAddress(entry?.address) === managedAddress
    );

    if (!member) {
      return res.status(403).json({ error: 'You are not a listed member of this circle.' });
    }

    if (!member.depositPaid) {
      return res.status(400).json({ error: 'You must acknowledge agreement first.' });
    }

    const expectedRound = Number(circle.currentRound || 0) + 1;
    if (round !== expectedRound) {
      return res.status(400).json({ error: `Only current round (${expectedRound}) can be paid.` });
    }

    if ((member.roundsPaid || []).some((paidRound) => Number(paidRound) === round)) {
      return res.status(409).json({ error: `Round ${round} has already been paid by this member.` });
    }

    const nextDueAt = normalizeFlowTimestamp(circle.nextPayoutTime);
    if (!nextDueAt) {
      return res.status(400).json({ error: 'Contribution schedule is not ready yet.' });
    }

    if (Date.now() < nextDueAt * 1000) {
      return res.status(400).json({ error: 'Cannot make payment until due date.' });
    }

    const expectedAmount = Number(circle.config?.contributionAmount || 0);
    if (!Number.isFinite(expectedAmount) || amount !== expectedAmount) {
      return res.status(400).json({ error: `Contribution amount must be ${expectedAmount.toFixed(2)}.` });
    }

    inFlightKey = `${circleId}:${managedAddress}:${round}`;
    if (inFlightContributionRequests.has(inFlightKey)) {
      return res.status(409).json({ error: 'A contribution request is already processing for this round.' });
    }
    inFlightContributionRequests.add(inFlightKey);

    const result = await sendSponsoredContribution({
      circleId,
      memberAddress: managedAddress,
      round,
      amount,
    });

    return res.status(200).json({
      ok: true,
      transactionId: result.transactionId,
      mode: 'sponsored',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Walletless contribution failed.' });
  } finally {
    if (inFlightKey) {
      inFlightContributionRequests.delete(inFlightKey);
    }
  }
}
