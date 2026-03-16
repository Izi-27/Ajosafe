import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { assertFlowReady } from '@/lib/flow/client';

export const acknowledgeAgreementTransaction = async (circleId) => {
  assertFlowReady();

  const transactionId = await fcl.mutate({
    cadence: `
      import AjoCircle from 0xAjoCircle
      
      transaction(circleId: UInt64) {
        let member: Address

        prepare(signer: &Account) {
          self.member = signer.address
        }
        
        execute {
          AjoCircle.acknowledgeAgreement(
            circleId: circleId,
            member: self.member
          )
        }
      }
    `,
    args: (arg, t) => [arg(String(circleId), t.UInt64)],
    proposer: fcl.authz,
    payer: fcl.authz,
    authorizations: [fcl.authz],
    limit: 9999,
  });

  const transaction = await fcl.tx(transactionId).onceSealed();
  return { transactionId, transaction };
};
