# AjoSafe

AjoSafe is a digital savings-circle platform that turns traditional Ajo, Esusu, and thrift groups into transparent, rule-based, onchain savings products.

Instead of trusting one collector to hold everyone else's money, AjoSafe uses smart contracts on Flow to define the circle, track contributions, enforce payout order, and keep the group aligned around shared rules.

## Project Status

AjoSafe is currently in active hackathon development.

- The core web app is live
- The Flow smart contract is deployed on testnet
- Circle creation and contribution flows are implemented
- Filecoin-backed agreement storage is integrated through Synapse, pending fully funded live verification
- Walletless login and fiat onboarding remain post-hack expansion items

## Value Proposition

AjoSafe is designed for ordinary people who already understand group savings, but want a safer and more structured way to run them.

It creates value by:

- reducing collector risk and payout disputes
- making savings-circle rules visible and consistent
- giving members a shared record of participation and progress
- making informal group finance easier to trust, explain, and manage
- preparing the product for mainstream onboarding over time, including easier login and fiat on-ramps

## Who AjoSafe Is For

- family and friends savings circles
- women-led savings groups
- market associations and cooperatives
- community groups, churches, and local societies
- diaspora groups coordinating savings back home
- first-time crypto users who need a simpler entry point into blockchain-based finance

## Core Product Values

- trust through rules, not personalities
- transparency for every member in the circle
- fairness in contribution and payout expectations
- accountability without relying on one middleman
- preserving the community model of Ajo while removing its biggest failure points

## What AjoSafe Offers

- smart contract-based circle creation on Flow
- fixed contribution structure and payout logic
- member-by-member circle visibility
- agreement storage support through Filecoin via Synapse
- dashboard and circle detail views for tracking group progress
- a foundation for future walletless onboarding and fiat rails
- a structure that can evolve into a mainstream savings product without losing the cultural familiarity of Ajo

## Current Implementation

### Implemented

- landing page and product positioning
- dashboard experience for viewing circles
- create-circle flow with validation
- circle detail page and contribution action flow
- deployed Flow testnet contract for `AjoCircle`
- Flow transaction and query integration from the frontend
- Filecoin agreement storage adapter using Synapse-oriented server routes
- form and runtime guardrails around invalid member setup and missing configuration
- public Vercel deployment for product demonstration

### In Progress During The Hack

- live end-to-end testing of circle creation against fully configured Synapse storage
- production-ready environment setup for Filecoin-backed agreement uploads
- tighter user-flow validation on the live deployment
- demo narrative and submission packaging

### Not Yet Implemented

- walletless login in the live runtime
- NGN direct deposit / fiat on-ramp
- SMS or WhatsApp reminders
- reputation scoring
- mobile application

## Hackathon Progress

| Area | Status | Notes |
| --- | --- | --- |
| Flow smart contract | Done | Contract deployed to Flow testnet |
| Frontend application | Done | Public build is live and usable |
| Circle creation UI | Done | Multi-step flow implemented |
| Contribution flow | Done | Transaction path implemented |
| Filecoin agreement storage | Partial | Synapse path is built, but depends on funded env configuration |
| Walletless onboarding | Pending | Product direction remains valid, runtime implementation still pending |
| Fiat onboarding | Pending | Not yet integrated in the hackathon build |

## Architecture

### Frontend

- Next.js
- React
- Tailwind CSS
- Zustand
- React Query

### Blockchain

- Flow Testnet
- Cadence smart contracts
- Flow Client Library (FCL)

### Storage

- Filecoin via Synapse SDK
- server-side upload and retrieval routes in `src/pages/api/filecoin`

### Current Application Structure

```text
ajosafe/
|-- contracts/              Cadence smart contracts
|-- src/
|   |-- components/         UI components
|   |-- lib/
|   |   |-- flow/           Flow queries and transactions
|   |   |-- filecoin/       Synapse-backed storage logic
|   |   `-- utils/          Formatters and validation helpers
|   |-- pages/              Next.js routes
|   |-- store/              Zustand stores
|   `-- styles/             Global styles
|-- flow.json              Flow deployment configuration
`-- package.json           App scripts and dependencies
```

## User Flow

1. A user connects a Flow wallet
2. The user creates a savings circle and defines members, contribution amount, and schedule
3. The group agreement is uploaded through the Filecoin storage path
4. The circle is created on Flow testnet
5. Members can open the circle, review its status, and contribute according to the defined rules
6. The product evolves toward easier onboarding, reminders, and fiat entry points

## Flow Contract

- Contract name: `AjoCircle`
- Network: Flow Testnet
- Address: `0xf7f80e14d9d60ea3`

## Environment Variables

Create `.env.local` from `.env.example` and configure:

```env
NEXT_PUBLIC_FLOW_NETWORK=testnet
NEXT_PUBLIC_FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
NEXT_PUBLIC_FLOW_DISCOVERY_WALLET=https://fcl-discovery.onflow.org/testnet/authn
NEXT_PUBLIC_FLOW_CONTRACT_ADDRESS=0xf7f80e14d9d60ea3

FILECOIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
FILECOIN_SYNAPSE_PRIVATE_KEY=YOUR_FILECOIN_CALIBRATION_PRIVATE_KEY

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=AjoSafe
```

## Local Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Deploy or update the Flow contract:

```bash
flow project deploy --network testnet
```

## Roadmap

### Current Hackathon Scope

- [x] Deploy Flow savings-circle contract
- [x] Build public web application
- [x] Implement create-circle experience
- [x] Implement contribution flow
- [x] Connect frontend to Flow testnet
- [x] Add Filecoin agreement storage path
- [ ] Complete live Synapse-backed create-circle testing
- [ ] Finalize public demo flow and walkthrough

### Post-Hack Roadmap

- [ ] Walletless login for mainstream onboarding
- [ ] NGN deposit and fiat on-ramp support
- [ ] SMS and messaging reminders
- [ ] Better member invitation flows
- [ ] Reputation and participation scoring
- [ ] Mobile app experience
- [ ] Multi-currency circles
- [ ] Insurance and protection layers

## Why This Matters

AjoSafe is not trying to replace the culture of group savings. It is trying to protect it.

The product keeps the social strength of Ajo, but removes the weakest parts of the traditional model: hidden rules, payout disputes, and the risk of one person disappearing with everyone else's money.
