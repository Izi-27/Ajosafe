import * as fcl from '@onflow/fcl';

fcl.config({
  'accessNode.api': process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || 'https://rest-testnet.onflow.org',
  'discovery.wallet': process.env.NEXT_PUBLIC_FLOW_DISCOVERY_WALLET || 'https://fcl-discovery.onflow.org/testnet/authn',
  'app.detail.title': 'AjoSafe',
  'app.detail.icon': 'https://ajosafe.vercel.app/icon.png',
  'app.detail.description': 'Ajo that can\'t run away with your money',
  '0xAjoCircle': process.env.NEXT_PUBLIC_FLOW_CONTRACT_ADDRESS || '0xf8d6e0586b0a20c7',
});

export { fcl };

export const authenticate = () => fcl.authenticate();
export const unauthenticate = () => fcl.unauthenticate();
export const currentUser = () => fcl.currentUser;
export const authz = fcl.authz;
export const query = fcl.query;
export const mutate = fcl.mutate;
export const tx = fcl.tx;
export const events = fcl.events;
