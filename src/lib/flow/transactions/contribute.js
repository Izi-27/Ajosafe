import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { assertFlowReady } from '@/lib/flow/client';

const FLOW_TX_TIMEOUT_MS = 120000;

function waitForSealWithTimeout(transactionId, timeoutMs = FLOW_TX_TIMEOUT_MS) {
  return Promise.race([
    fcl.tx(transactionId).onceSealed(),
    new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              'Flow transaction confirmation timed out. Please check wallet activity and try again.'
            )
          ),
        timeoutMs
      )
    ),
  ]);
}

export const contributeTransaction = async (circleId, round, amount) => {
  assertFlowReady();

  const transactionId = await fcl.mutate({
    cadence: `
      import AjoCircle from 0xAjoCircle
      
      transaction(circleId: UInt64, round: UInt64, amount: UFix64) {
        let member: Address

        prepare(signer: &Account) {
          self.member = signer.address
        }
        
        execute {
          AjoCircle.contribute(
            circleId: circleId,
            member: self.member,
            round: round,
            amount: amount
          )
        }
      }
    `,
    args: (arg, t) => [
      arg(String(circleId), t.UInt64),
      arg(String(round), t.UInt64),
      arg(amount.toFixed(2), t.UFix64),
    ],
    proposer: fcl.authz,
    payer: fcl.authz,
    authorizations: [fcl.authz],
    limit: 9999,
  });

  const transaction = await waitForSealWithTimeout(transactionId);

  if (transaction?.statusCode && transaction.statusCode !== 0) {
    throw new Error(
      transaction.errorMessage || 'Flow transaction failed while submitting contribution.'
    );
  }

  return { transactionId, transaction };
};
