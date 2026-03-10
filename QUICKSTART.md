# AjoSafe Quick Start

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment

Copy `.env.example` to `.env.local` and set:

```env
NEXT_PUBLIC_FLOW_NETWORK=testnet
NEXT_PUBLIC_FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
NEXT_PUBLIC_FLOW_DISCOVERY_WALLET=https://fcl-discovery.onflow.org/testnet/authn
NEXT_PUBLIC_FLOW_CONTRACT_ADDRESS=0xf7f80e14d9d60ea3

FILECOIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
FILECOIN_SYNAPSE_PRIVATE_KEY=YOUR_FILECOIN_CALIBRATION_PRIVATE_KEY
```

## 3. Deploy the Flow contract

The current testnet deployment is:

- Contract: `AjoCircle`
- Address: `0xf7f80e14d9d60ea3`

If you need to redeploy or update the contract, use:

```bash
flow project deploy --network testnet
```

## 4. Start the app

```bash
npm run dev
```

## Current reality

- The UI is present.
- The contract is deployed on Flow testnet at `0xf7f80e14d9d60ea3`.
- Filecoin agreement storage now expects Synapse configuration, not Lighthouse.
- Test scripts are listed in `package.json`, but automated coverage has not been built out yet.
