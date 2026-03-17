import { create } from 'zustand';
import { getUserCirclesQuery, getCircleQuery } from '@/lib/flow/queries/getCircle';
import { createCircleTransaction } from '@/lib/flow/transactions/createCircle';
import { contributeTransaction } from '@/lib/flow/transactions/contribute';
import { acknowledgeAgreementTransaction } from '@/lib/flow/transactions/acknowledgeAgreement';
import { storeAgreementOnFilecoin, createAgreementAcknowledgement } from '@/lib/filecoin/storage';
import { frequencyToSeconds } from '@/lib/utils/formatters';

const OPTIONAL_ARCHIVE_TIMEOUT_MS = 15000;

function withTimeout(promise, timeoutMs, timeoutMessage) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(timeoutMessage));
      }, timeoutMs);
    }),
  ]);
}

const useCircleStore = create((set, get) => ({
  circles: [],
  currentCircle: null,
  loading: false,
  error: null,

  fetchUserCircles: async (address) => {
    set({ loading: true, error: null });
    try {
      const circleIds = await getUserCirclesQuery(address);
      
      const circles = await Promise.all(
        circleIds.map(async (id) => {
          const circle = await getCircleQuery(id);
          return circle;
        })
      );

      set({ circles, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchCircleDetails: async (circleId) => {
    set({ loading: true, error: null });
    try {
      const circle = await getCircleQuery(circleId);
      set({ currentCircle: circle, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createCircle: async (circleData) => {
    set({ loading: true, error: null });
    try {
      if (circleData.members.length !== circleData.totalRounds) {
        throw new Error('Total rounds must match the number of members for the current payout model.');
      }

      const { cid } = await storeAgreementOnFilecoin({
        name: circleData.name,
        description: circleData.description,
        contributionAmount: circleData.contributionAmount,
        frequency: circleData.frequency,
        frequencySeconds: frequencyToSeconds(circleData.frequency),
        totalRounds: circleData.totalRounds,
        penaltyRate: circleData.penaltyRate,
        members: circleData.members,
        creatorAddress: circleData.members[0]?.address || null,
        payoutOrder: circleData.members.map(m => m.address),
      });

      const { circleId } = await createCircleTransaction({
        name: circleData.name,
        description: circleData.description || '',
        contributionAmount: parseFloat(circleData.contributionAmount),
        contributionFrequency: frequencyToSeconds(circleData.frequency),
        totalRounds: parseInt(circleData.totalRounds),
        penaltyRate: parseFloat(circleData.penaltyRate || 0.1),
        agreementCID: cid,
        memberAddresses: circleData.members.map(m => m.address),
        memberNames: circleData.members.map(m => m.name),
        memberPhones: circleData.members.map(m => m.phone || null),
        memberEmails: circleData.members.map(m => m.email || null),
      });

      if (circleId === undefined || circleId === null) {
        throw new Error('Circle transaction was sealed, but no circle ID was returned.');
      }

      let agreementAcknowledgementCid = null;
      let warning = null;

      try {
        agreementAcknowledgementCid = await withTimeout(
          createAgreementAcknowledgement({
            circleId,
            agreementCid: cid,
            memberAddress: circleData.members[0]?.address,
            memberName: circleData.members[0]?.name,
            role: 'creator',
          }),
          OPTIONAL_ARCHIVE_TIMEOUT_MS,
          'Creator acknowledgement archival timed out'
        );
      } catch (acknowledgementError) {
        warning =
          'Circle created, but the creator acknowledgement record could not be saved to Filecoin right now.';
      }

      set({ loading: false });
      return { circleId, agreementCid: cid, agreementAcknowledgementCid, warning };
    } catch (error) {
      let message = error.message || 'Failed to create circle';

      if (message.includes('Filecoin storage is not configured')) {
        message = 'Agreement storage is not configured in this deployment yet. Add the Synapse environment variables before creating circles.';
      }

      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  acknowledgeAgreement: async ({ circleId, agreementCid, memberAddress, memberName }) => {
    set({ loading: true, error: null });
    try {
      await acknowledgeAgreementTransaction(circleId);
      await get().fetchCircleDetails(circleId);

      let warning = null;
      let acknowledgementCid = null;

      try {
        acknowledgementCid = await withTimeout(
          createAgreementAcknowledgement({
            circleId,
            agreementCid,
            memberAddress,
            memberName,
            role: 'member',
          }),
          OPTIONAL_ARCHIVE_TIMEOUT_MS,
          'Agreement acknowledgement archival timed out'
        );
      } catch (acknowledgementError) {
        warning =
          'Agreement acknowledged on Flow, but the Filecoin acknowledgement record could not be saved right now.';
      }

      set({ loading: false });
      return { acknowledgementCid, warning };
    } catch (error) {
      const message = error.message || 'Failed to acknowledge agreement';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  makeContribution: async (circleId, round, amount) => {
    set({ loading: true, error: null });
    try {
      await contributeTransaction(circleId, round, amount);
      
      await get().fetchCircleDetails(circleId);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useCircleStore;
