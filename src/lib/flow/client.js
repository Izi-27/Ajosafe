import * as fcl from '@onflow/fcl';

const contractAddress = process.env.NEXT_PUBLIC_FLOW_CONTRACT_ADDRESS;

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

fcl.config(flowConfig);

export { fcl };

export function assertFlowReady() {
  if (!contractAddress) {
    throw new Error(
      'NEXT_PUBLIC_FLOW_CONTRACT_ADDRESS is not set. Deploy the AjoCircle contract to Flow testnet and configure the address before using circle actions.'
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
