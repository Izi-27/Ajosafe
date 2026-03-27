import crypto from 'crypto';
import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';

const FLOW_TX_TIMEOUT_MS = 120000;

function normalizeFlowAddress(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }

  const prefixed = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`;
  if (!/^0x[0-9a-f]{16}$/.test(prefixed)) {
    return null;
  }

  return prefixed;
}

function sanitizeHex(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  const hex = trimmed.startsWith('0x') ? trimmed.slice(2) : trimmed;
  return /^[0-9a-f]+$/.test(hex) ? hex : null;
}

function base64url(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function buildP256PrivateKeyFromHex(privateKeyHex) {
  const rawPrivateKey = Buffer.from(privateKeyHex, 'hex');
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.setPrivateKey(rawPrivateKey);
  const uncompressedPublicKey = ecdh.getPublicKey(undefined, 'uncompressed');
  const x = uncompressedPublicKey.subarray(1, 33);
  const y = uncompressedPublicKey.subarray(33, 65);

  return crypto.createPrivateKey({
    key: {
      kty: 'EC',
      crv: 'P-256',
      d: base64url(rawPrivateKey),
      x: base64url(x),
      y: base64url(y),
    },
    format: 'jwk',
  });
}

function signFlowMessage(privateKeyHex, messageHex) {
  const privateKey = buildP256PrivateKeyFromHex(privateKeyHex);
  const signature = crypto.sign('sha3-256', Buffer.from(messageHex, 'hex'), {
    key: privateKey,
    dsaEncoding: 'ieee-p1363',
  });

  return signature.toString('hex');
}

function getFlowConfig() {
  const accessNode = process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || 'https://rest-testnet.onflow.org';
  const contractAddress = normalizeFlowAddress(process.env.NEXT_PUBLIC_FLOW_CONTRACT_ADDRESS || '0xf7f80e14d9d60ea3');
  const sponsorAddress = normalizeFlowAddress(process.env.FLOW_SPONSOR_ADDRESS);
  const sponsorPrivateKey = sanitizeHex(process.env.FLOW_SPONSOR_PRIVATE_KEY);
  const sponsorKeyId = Number(process.env.FLOW_SPONSOR_KEY_ID || 0);

  if (!contractAddress) {
    throw new Error('NEXT_PUBLIC_FLOW_CONTRACT_ADDRESS is invalid or missing.');
  }

  if (!sponsorAddress || !sponsorPrivateKey) {
    throw new Error('Sponsored transactions require FLOW_SPONSOR_ADDRESS and FLOW_SPONSOR_PRIVATE_KEY.');
  }

  if (!Number.isInteger(sponsorKeyId) || sponsorKeyId < 0) {
    throw new Error('FLOW_SPONSOR_KEY_ID must be a non-negative integer.');
  }

  fcl.config({
    'accessNode.api': accessNode,
    '0xAjoCircle': contractAddress,
  });

  return {
    contractAddress,
    sponsorAddress,
    sponsorPrivateKey,
    sponsorKeyId,
  };
}

function createSponsorAuthz({ sponsorAddress, sponsorPrivateKey, sponsorKeyId }) {
  return (account = {}) => {
    return {
      ...account,
      tempId: `${sponsorAddress}-${sponsorKeyId}`,
      addr: sponsorAddress,
      keyId: sponsorKeyId,
      signingFunction: async (signable) => {
        const signature = signFlowMessage(sponsorPrivateKey, signable.message);
        return {
          addr: sponsorAddress,
          keyId: sponsorKeyId,
          signature,
        };
      },
    };
  };
}

async function waitForSealWithTimeout(transactionId, timeoutMs = FLOW_TX_TIMEOUT_MS) {
  return Promise.race([
    fcl.tx(transactionId).onceSealed(),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Sponsored transaction confirmation timed out.')),
        timeoutMs
      )
    ),
  ]);
}

export async function getCircleById(circleId) {
  getFlowConfig();

  return fcl.query({
    cadence: `
      import AjoCircle from 0xAjoCircle

      access(all) fun main(circleId: UInt64): AjoCircle.Circle? {
        return AjoCircle.getCircle(circleId: circleId)
      }
    `,
    args: (arg) => [arg(String(circleId), t.UInt64)],
  });
}

export async function sendSponsoredAcknowledge({ circleId, memberAddress }) {
  const flowConfig = getFlowConfig();
  const sponsorAuthz = createSponsorAuthz(flowConfig);

  const transactionId = await fcl.mutate({
    cadence: `
      import AjoCircle from 0xAjoCircle

      transaction(circleId: UInt64, member: Address) {
        execute {
          AjoCircle.acknowledgeAgreement(circleId: circleId, member: member)
        }
      }
    `,
    args: (arg) => [
      arg(String(circleId), t.UInt64),
      arg(memberAddress, t.Address),
    ],
    proposer: sponsorAuthz,
    payer: sponsorAuthz,
    authorizations: [sponsorAuthz],
    limit: 9999,
  });

  const transaction = await waitForSealWithTimeout(transactionId);
  if (transaction?.statusCode && transaction.statusCode !== 0) {
    throw new Error(transaction.errorMessage || 'Sponsored acknowledge transaction failed.');
  }

  return { transactionId, transaction };
}

export async function sendSponsoredContribution({
  circleId,
  memberAddress,
  round,
  amount,
}) {
  const flowConfig = getFlowConfig();
  const sponsorAuthz = createSponsorAuthz(flowConfig);

  const transactionId = await fcl.mutate({
    cadence: `
      import AjoCircle from 0xAjoCircle

      transaction(circleId: UInt64, member: Address, round: UInt64, amount: UFix64) {
        execute {
          AjoCircle.contribute(
            circleId: circleId,
            member: member,
            round: round,
            amount: amount
          )
        }
      }
    `,
    args: (arg) => [
      arg(String(circleId), t.UInt64),
      arg(memberAddress, t.Address),
      arg(String(round), t.UInt64),
      arg(Number(amount).toFixed(2), t.UFix64),
    ],
    proposer: sponsorAuthz,
    payer: sponsorAuthz,
    authorizations: [sponsorAuthz],
    limit: 9999,
  });

  const transaction = await waitForSealWithTimeout(transactionId);
  if (transaction?.statusCode && transaction.statusCode !== 0) {
    throw new Error(transaction.errorMessage || 'Sponsored contribution transaction failed.');
  }

  return { transactionId, transaction };
}

export function parseCircleStatus(status) {
  if (typeof status === 'number' && Number.isFinite(status)) {
    return status;
  }

  if (typeof status === 'string') {
    if (/^\d+$/.test(status)) {
      return parseInt(status, 10);
    }
    const mapped = {
      ACTIVE: 0,
      PAUSED: 1,
      COMPLETED: 2,
      DISSOLVED: 3,
      PENDING_ACKNOWLEDGEMENT: 4,
    };
    return mapped[status] ?? null;
  }

  if (status && typeof status === 'object') {
    if ('rawValue' in status) {
      return parseCircleStatus(status.rawValue);
    }
    if ('value' in status) {
      return parseCircleStatus(status.value);
    }
    if ('case' in status) {
      return parseCircleStatus(status.case);
    }
  }

  return null;
}

export function normalizeCircleMemberAddress(address) {
  return normalizeFlowAddress(address);
}
