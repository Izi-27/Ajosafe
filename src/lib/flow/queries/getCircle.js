import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';

export const getCircleQuery = async (circleId) => {
  const result = await fcl.query({
    cadence: `
      import AjoCircle from 0xAjoCircle
      
      pub fun main(circleId: UInt64): AjoCircle.Circle? {
        return AjoCircle.getCircle(circleId: circleId)
      }
    `,
    args: (arg, t) => [arg(circleId, t.UInt64)],
  });

  return result;
};

export const getUserCirclesQuery = async (address) => {
  const result = await fcl.query({
    cadence: `
      import AjoCircle from 0xAjoCircle
      
      pub fun main(address: Address): [UInt64]? {
        return AjoCircle.getUserCircles(address: address)
      }
    `,
    args: (arg, t) => [arg(address, t.Address)],
  });

  return result || [];
};

export const getMemberInfoQuery = async (circleId, memberAddress) => {
  const result = await fcl.query({
    cadence: `
      import AjoCircle from 0xAjoCircle
      
      pub fun main(circleId: UInt64, member: Address): AjoCircle.Member? {
        return AjoCircle.getMemberInfo(circleId: circleId, member: member)
      }
    `,
    args: (arg, t) => [
      arg(circleId, t.UInt64),
      arg(memberAddress, t.Address),
    ],
  });

  return result;
};

export const getNextPayoutQuery = async (circleId) => {
  const result = await fcl.query({
    cadence: `
      import AjoCircle from 0xAjoCircle
      
      pub fun main(circleId: UInt64): Address? {
        return AjoCircle.getNextPayout(circleId: circleId)
      }
    `,
    args: (arg, t) => [arg(circleId, t.UInt64)],
  });

  return result;
};
