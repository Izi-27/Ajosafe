# AjoSafe

Decentralized savings circles on Flow, with agreement storage on Filecoin.

## Current Status

This repository is not at the originally claimed "Phase 1 complete" state.

### Delivery status vs roadmap

| Roadmap item | README claim | Actual status | Notes |
| --- | --- | --- | --- |
| Core smart contract | Complete | Partial | Contract existed, but the public API, signer flow, and deployment story were inconsistent. This repo now contains a cleaned-up MVP contract interface, but it is still not deployed to Flow testnet. |
| Circle creation flow | Complete | Partial | The multi-step UI exists. End-to-end creation depends on a real deployed Flow contract and a configured Synapse-backed Filecoin uploader. |
| Contribution functionality | Complete | Partial | Contribution UI and transaction wrapper exist. Actual contributions depend on the same undeployed Flow contract. |
| Filecoin integration | Complete | Not complete | The repo previously used Lighthouse. It has been refactored toward Synapse-based storage, but it still requires Synapse credentials and funding before uploads succeed. |
| Basic UI | Complete | Mostly complete | Landing page, dashboard, circle creation, and circle detail views exist. They still need real backend/on-chain data to be fully usable. |

### Important corrections

- Filecoin SDK for this project is `Synapse SDK`, not Lighthouse.
- The Flow contract is not deployed to testnet from this repo.
- The old docs overstated build status and deployment readiness.

## Architecture

### Frontend

- Next.js
- Tailwind CSS
- Zustand
- React Query

### Blockchain

- Flow testnet
- Cadence
- Flow Client Library

### Storage

- Filecoin via Synapse SDK
- Server-side upload/download adapter under `src/pages/api/filecoin`

## What Works Today

- Marketing and dashboard UI scaffold
- Circle creation form and review flow
- Flow client configuration guardrails
- Cadence contract and transaction/query wrappers aligned to the same interface
- Synapse-oriented Filecoin storage adapter shape

## What Is Still Blocked

- Real Flow testnet contract deployment
- End-to-end circle creation against testnet
- Synapse account setup, payment channel funding, and production upload verification
- Walletless auth implementation beyond standard FCL wallet discovery
- Automated tests
- Notifications, fiat rails, and mobile app work from later roadmap phases

## Required Environment Variables

Create `.env.local` from `.env.example` and set:

```env
NEXT_PUBLIC_FLOW_NETWORK=testnet
NEXT_PUBLIC_FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
NEXT_PUBLIC_FLOW_DISCOVERY_WALLET=https://fcl-discovery.onflow.org/testnet/authn
NEXT_PUBLIC_FLOW_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT

FILECOIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
FILECOIN_SYNAPSE_PRIVATE_KEY=YOUR_FILECOIN_PRIVATE_KEY

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=AjoSafe
```

## Flow Contract Status

- Contract source: `contracts/AjoCircle.cdc`
- Deployment config: `flow.json`
- Current state: not deployed to testnet from this repo

Until `NEXT_PUBLIC_FLOW_CONTRACT_ADDRESS` points to a real deployed contract, the app will block circle actions instead of silently targeting a fake default address.

## Filecoin Status

Agreement storage now targets a server-side Synapse adapter instead of Lighthouse.

This repo still requires:

1. a valid Synapse-supported private key,
2. a reachable Filecoin Calibration RPC,
3. Synapse storage/payment setup that can actually accept uploads.

Without those, agreement storage will fail with explicit API errors.

## Development Notes

- `flow.json` should be treated as local deployment config, not proof of a successful deployment.
- No `tests/` directory exists yet even though older docs referenced one.
- The next recommended milestone is to deploy the repaired contract to testnet, set the contract address, then verify one full create-circle flow.

## Roadmap

### Phase 1: MVP hardening

- [ ] Deploy repaired Flow contract to testnet
- [ ] Verify create circle transaction end-to-end
- [ ] Verify contribution transaction end-to-end
- [ ] Verify Synapse agreement upload and retrieval
- [ ] Add smoke tests for core happy paths

### Phase 2

- [ ] SMS notifications
- [ ] Fiat on-ramp integration
- [ ] Multi-currency support
- [ ] Reputation system
- [ ] Mobile app

### Phase 3

- [ ] Insurance pool
- [ ] Yield generation
- [ ] Cross-chain support
- [ ] DAO governance
