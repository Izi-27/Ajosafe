import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';

export const contributeTransaction = async (circleId, round, amount) => {
  const transactionId = await fcl.mutate({
    cadence: `
      import AjoCircle from 0xAjoCircle
      
      transaction(circleId: UInt64, round: UInt64, amount: UFix64) {
        prepare(acct: AuthAccount) {}
        
        execute {
          AjoCircle.contribute(
            circleId: circleId,
            round: round,
            amount: amount
          )
        }
      }
    `,
    args: (arg, t) => [
      arg(circleId, t.UInt64),
      arg(round, t.UInt64),
      arg(amount.toFixed(2), t.UFix64),
    ],
    proposer: fcl.authz,
    payer: fcl.authz,
    authorizations: [fcl.authz],
    limit: 9999,
  });

  const transaction = await fcl.tx(transactionId).onceSealed();
  return { transactionId, transaction };
};
