# Manual Flow Deployment Notes

## Current state

The contract in this repo has not been confirmed as deployed to Flow testnet.

The correct next step is to deploy `contracts/AjoCircle.cdc`, capture the real contract address, and set:

```env
NEXT_PUBLIC_FLOW_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT
```

## Recommended path

1. Review `flow.json`.
2. Make sure the deployer account and key are valid for testnet.
3. Deploy with:

```bash
flow project deploy --network testnet
```

4. Update `.env.local` with the deployed address.
5. Run one real create-circle transaction from the frontend.

## Notes

- This file is a deployment guide, not proof that deployment already happened.
- Do not treat any placeholder or undeployed address as production-ready.
- If Cadence or Flow CLI compatibility issues appear, fix the contract or deployment transaction before continuing frontend work.
