# AjoSafe

**Tagline:** "Ajo that can't run away with your money"

AjoSafe is a digital savings-circle platform inspired by Ajo, Esusu, and other rotating savings groups. The current product turns informal savings circles into transparent, rule-based digital groups on Flow, with shared agreement records stored on Filecoin.

## Current Value Proposition

AjoSafe turns informal savings circles into transparent, rule-based digital groups. It gives members a shared onchain record of circle rules, contribution progress, payout order, and agreement terms stored on Filecoin, reducing collector risk and dispute risk while building toward stronger automated enforcement.

## What AjoSafe Is Today

The live hackathon build focuses on structure, visibility, and shared accountability.

- circle rules are defined before the group starts
- the agreement record is stored on Filecoin via Synapse
- core circle state lives on Flow testnet
- members can view contribution progress and payout order
- the app reduces dependence on one collector or one private notebook

In its current form, AjoSafe is best understood as a **transparent, rule-based coordination layer for savings circles**.

## Long-Term Product Vision

The long-term goal is still the original promise behind the brand:

**Ajo that can't run away with your money.**

That post-hack version requires stronger enforcement than the current build provides, including real escrowed funds, mandatory deposits, slashing or reserve coverage for defaults, and deeper automation around payout protection.

## Problem

Traditional savings circles are powerful because they are familiar, social, and accessible. They also break down in predictable ways:

- one collector becomes the single point of failure
- rules are verbal or poorly documented
- disputes happen when expectations are unclear
- members can default after receiving their payout
- new users face high friction when digital finance tools feel unfamiliar

AjoSafe addresses the first layer of this problem now by making circle rules visible, shared, and durable. It addresses the deeper enforcement problem in the post-hack roadmap.

## Who AjoSafe Is For

- family and friends savings circles
- women-led informal savings groups
- local cooperatives, market associations, and church groups
- diaspora groups coordinating contributions back home
- first-time onchain users who need a simpler, more familiar savings model

## Core Product Values

- transparency over ambiguity
- shared rules over verbal assumptions
- accountability over blind trust
- cultural familiarity without collector risk
- practical coordination first, deeper enforcement next

## What The Current Build Delivers

### Implemented

- public web app deployed on Vercel
- Flow testnet smart contract for circle state and contribution tracking
- Flow wallet-based authentication through FCL
- create-circle flow with validation
- contribution flow from the circle page
- Filecoin-backed agreement upload and retrieval through Synapse
- circle detail view with member list, payout timeline, and agreement record
- onchain storage of agreement CID inside the Flow contract

### Working End-to-End

- create a circle
- store the agreement on Filecoin
- create the circle on Flow testnet
- load the agreement back on the circle page
- make contributions to the created circle

### Not Yet Implemented In The Live Runtime

- walletless email or passkey login
- NGN deposit or fiat on-ramp
- real escrow of circle funds
- mandatory deposit payment before activation
- deposit slashing or reserve coverage for defaulters
- automated scheduled payouts
- invite links and member-acceptance flow
- reminders via SMS, WhatsApp, or email
- reputation scoring
- dedicated mobile app

## What The Current Build Does Not Yet Claim

The live hackathon build does **not** yet fully guarantee that a member who has already been paid cannot default without hurting the group.

Today, AjoSafe can:

- define the rules
- record the agreement
- track contributions
- show payout order
- model default and expulsion states in contract logic

It does **not yet** provide:

- real fund escrow
- enforced forward commitment of future contributions
- automatic deposit seizure to cover group losses
- a fully collateralized anti-default system

That stronger enforcement layer is part of the post-hack roadmap, not the current product claim.

## Architecture

### Frontend

- Next.js
- React
- Tailwind CSS
- Zustand
- React Query

### Blockchain

- Flow Testnet
- Cadence smart contract: `AjoCircle`
- Flow Client Library (FCL)

### Storage

- Filecoin via Synapse SDK
- server-side upload and retrieval routes under `src/pages/api/filecoin`

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
|-- flow.json               Flow deployment configuration
`-- package.json            App scripts and dependencies
```

## How AjoSafe Works Today

1. A user connects a Flow wallet.
2. A circle is created with members, contribution amount, schedule, and penalty settings.
3. The agreement is stored on Filecoin through Synapse.
4. The agreement CID is saved inside the Flow contract.
5. The new circle can be viewed on the dashboard and circle detail page.
6. Members can contribute according to the configured rules.

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

Fund Filecoin Pay for Synapse storage preparation:

```bash
npm run fund:filecoin-pay
```

## Roadmap

### Hackathon Build

- [x] Deploy `AjoCircle` on Flow testnet
- [x] Build the public web application
- [x] Implement create-circle flow
- [x] Implement contribution flow
- [x] Connect the frontend to Flow testnet
- [x] Add Filecoin agreement storage with Synapse
- [x] Retrieve and display stored agreement records
- [ ] Improve UX for long Filecoin-backed circle creation
- [ ] Finalize public demo flow, script, and submission materials

### Post-Hack Product Roadmap

#### Enforcement Layer

- [ ] real token escrow for circle funds
- [ ] mandatory deposit funding before circle activation
- [ ] deposit slashing or reserve logic for defaults
- [ ] payout eligibility tied to contribution compliance
- [ ] economically robust handling of post-payout defaults

#### Mainstream Onboarding

- [ ] walletless login with email and passkeys
- [ ] better invitation and member-acceptance flows
- [ ] NGN deposit and fiat on-ramp support
- [ ] clearer onboarding for non-crypto-native users

#### Product Expansion

- [ ] reminders via SMS, email, or WhatsApp
- [ ] reputation and participation scoring
- [ ] mobile-first experience
- [ ] multi-currency circles
- [ ] stronger analytics and reporting for groups

## Positioning Summary

For the hackathon, AjoSafe should be positioned as:

**a transparent, rule-based digital savings-circle platform**

Not yet as:

**a fully escrowed, fully enforced anti-default savings system**

That stronger market promise remains the post-hack destination and the long-term version of the brand.

## Why This Matters

AjoSafe is not trying to replace the culture of group savings. It is trying to make that culture easier to trust, explain, document, and eventually protect more deeply with software.

The current build proves that savings-circle rules, membership, contribution progress, payout order, and agreement records can be made visible and durable. The next phase is to make the financial protection layer as strong as the social model deserves.
