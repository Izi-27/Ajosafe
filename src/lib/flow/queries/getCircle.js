import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { assertFlowReady } from '@/lib/flow/client';

export const getCircleQuery = async (circleId) => {
  assertFlowReady();

  const result = await fcl.query({
    cadence: `
      import AjoCircle from 0xAjoCircle
      
      access(all) fun main(circleId: UInt64): AjoCircle.Circle? {
        return AjoCircle.getCircle(circleId: circleId)
      }
    `,
    args: (arg, t) => [arg(circleId, t.UInt64)],
  });

  return result;
};

export const getUserCirclesQuery = async (address) => {
  assertFlowReady();

  const result = await fcl.query({
    cadence: `
      import AjoCircle from 0xAjoCircle
      
      access(all) fun main(address: Address): [UInt64]? {
        return AjoCircle.getUserCircles(address: address)
      }
    `,
    args: (arg, t) => [arg(address, t.Address)],
  });

  return result || [];
};

export const getMemberInfoQuery = async (circleId, memberAddress) => {
  assertFlowReady();

  const result = await fcl.query({
    cadence: `
      import AjoCircle from 0xAjoCircle
      
      access(all) fun main(circleId: UInt64, member: Address): AjoCircle.Member? {
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
  assertFlowReady();

  const result = await fcl.query({
    cadence: `
      import AjoCircle from 0xAjoCircle
      
      access(all) fun main(circleId: UInt64): Address? {
        return AjoCircle.getNextPayout(circleId: circleId)
      }
    `,
    args: (arg, t) => [arg(circleId, t.UInt64)],
  });

  return result;
};
