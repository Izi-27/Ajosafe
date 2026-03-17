import * as fcl from '@onflow/fcl';

const DEFAULT_TESTNET_CONTRACT_ADDRESS = '0xf7f80e14d9d60ea3';
const flowNetwork = process.env.NEXT_PUBLIC_FLOW_NETWORK || 'testnet';
const rawEnvContractAddress = process.env.NEXT_PUBLIC_FLOW_CONTRACT_ADDRESS;

function normalizeFlowAddress(value) {
  if (!value || typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const prefixed = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`;

  if (!/^0x[0-9a-fA-F]{16}$/.test(prefixed)) {
    return undefined;
  }

  return prefixed.toLowerCase();
}

const normalizedEnvContractAddress = normalizeFlowAddress(rawEnvContractAddress);
const contractAddress =
  normalizedEnvContractAddress ||
  (flowNetwork === 'testnet' ? DEFAULT_TESTNET_CONTRACT_ADDRESS : undefined);

const flowConfig = {
  'accessNode.api': process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || 'https://rest-testnet.onflow.org',
  'discovery.wallet': process.env.NEXT_PUBLIC_FLOW_DISCOVERY_WALLET || 'https://fcl-discovery.onflow.org/testnet/authn',
  'app.detail.title': 'AjoSafe',
  'app.detail.icon': 'https://ajosafe.vercel.app/icon.png',
  'app.detail.description': 'Ajo that can\'t run away with your money',
};

if (contractAddress) {
  flowConfig['0xAjoCircle'] = contractAddress;
}

if (rawEnvContractAddress && !normalizedEnvContractAddress) {
  console.warn(
    `Invalid NEXT_PUBLIC_FLOW_CONTRACT_ADDRESS "${rawEnvContractAddress}". ` +
      `Using ${contractAddress || 'no contract address'} instead.`
  );
}

fcl.config(flowConfig);

export { fcl };

export function assertFlowReady() {
  if (!contractAddress) {
    throw new Error(
      'AjoCircle contract address is not configured for this network. Set NEXT_PUBLIC_FLOW_CONTRACT_ADDRESS before using circle actions.'
    );
  }
}

export const authenticate = () => fcl.authenticate();
export const unauthenticate = () => fcl.unauthenticate();
export const currentUser = () => fcl.currentUser;
export const authz = fcl.authz;
export const query = fcl.query;
export const mutate = fcl.mutate;
export const tx = fcl.tx;
export const events = fcl.events;
