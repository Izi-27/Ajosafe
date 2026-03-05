import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { assertFlowReady } from '@/lib/flow/client';

export const createCircleTransaction = async ({
  name,
  description,
  contributionAmount,
  contributionFrequency,
  totalRounds,
  penaltyRate,
  agreementCID,
  memberAddresses,
  memberNames,
  memberPhones,
  memberEmails,
}) => {
  assertFlowReady();

  const transactionId = await fcl.mutate({
    cadence: `
      import AjoCircle from 0xAjoCircle
      
      transaction(
        name: String,
        description: String,
        contributionAmount: UFix64,
        contributionFrequency: UInt64,
        totalRounds: UInt64,
        penaltyRate: UFix64,
        agreementCID: String,
        memberAddresses: [Address],
        memberNames: [String],
        memberPhones: [String?],
        memberEmails: [String?]
      ) {
        let creator: Address

        prepare(signer: &Account) {
          self.creator = signer.address
        }
        
        execute {
          let circleId = AjoCircle.createCircle(
            creator: self.creator,
            name: name,
            description: description,
            contributionAmount: contributionAmount,
            contributionFrequency: contributionFrequency,
            totalRounds: totalRounds,
            penaltyRate: penaltyRate,
            agreementCID: agreementCID,
            memberAddresses: memberAddresses,
            memberNames: memberNames,
            memberPhones: memberPhones,
            memberEmails: memberEmails
          )
          
          log("Circle created with ID: ")
          log(circleId)
        }
      }
    `,
    args: (arg, t) => [
      arg(name, t.String),
      arg(description, t.String),
      arg(contributionAmount.toFixed(2), t.UFix64),
      arg(contributionFrequency, t.UInt64),
      arg(totalRounds, t.UInt64),
      arg(penaltyRate.toFixed(2), t.UFix64),
      arg(agreementCID, t.String),
      arg(memberAddresses, t.Array(t.Address)),
      arg(memberNames, t.Array(t.String)),
      arg(memberPhones, t.Array(t.Optional(t.String))),
      arg(memberEmails, t.Array(t.Optional(t.String))),
    ],
    proposer: fcl.authz,
    payer: fcl.authz,
    authorizations: [fcl.authz],
    limit: 9999,
  });

  const transaction = await fcl.tx(transactionId).onceSealed();
  
  const circleCreatedEvent = transaction.events.find(
    (event) => event.type.includes('CircleCreated')
  );
  
  const circleId = circleCreatedEvent?.data?.circleId;
  
  return { transactionId, circleId };
};
