import { create } from 'zustand';
import { getUserCirclesQuery, getCircleQuery } from '@/lib/flow/queries/getCircle';
import { createCircleTransaction } from '@/lib/flow/transactions/createCircle';
import { contributeTransaction } from '@/lib/flow/transactions/contribute';
import { storeAgreementOnFilecoin } from '@/lib/filecoin/storage';
import { frequencyToSeconds } from '@/lib/utils/formatters';

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
        totalRounds: circleData.totalRounds,
        penaltyRate: circleData.penaltyRate,
        members: circleData.members,
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

      set({ loading: false });
      return { circleId, agreementCid: cid };
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
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
