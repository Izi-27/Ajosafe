# Manual Flow Deployment Notes

## Current state

The contract in this repo is deployed to Flow testnet.

Current deployed address:

```env
NEXT_PUBLIC_FLOW_CONTRACT_ADDRESS=0xf7f80e14d9d60ea3
```

Use the command below only when you need to update or redeploy the contract.

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

- This file is a deployment guide for future contract updates.
- The current deployed address above is the active testnet contract, not a placeholder.
- If Cadence or Flow CLI compatibility issues appear, fix the contract or deployment transaction before continuing frontend work.
