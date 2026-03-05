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
NEXT_PUBLIC_FLOW_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT

FILECOIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
FILECOIN_SYNAPSE_PRIVATE_KEY=YOUR_FILECOIN_PRIVATE_KEY
```

## 3. Deploy the Flow contract

This project is not usable against Flow until `contracts/AjoCircle.cdc` is deployed and `NEXT_PUBLIC_FLOW_CONTRACT_ADDRESS` is set.

Use:

```bash
flow project deploy --network testnet
```

If deployment fails, fix the contract or deployment configuration first. Do not leave the frontend pointed at a placeholder address.

## 4. Start the app

```bash
npm run dev
```

## Current reality

- The UI is present.
- The contract is not deployed by default.
- Filecoin agreement storage now expects Synapse configuration, not Lighthouse.
- Test scripts are listed in `package.json`, but automated coverage has not been built out yet.
