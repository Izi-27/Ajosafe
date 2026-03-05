import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import useCircleStore from '@/store/circleStore';
import useAuthStore from '@/store/authStore';
import { formatCurrency, formatTimeDistance, secondsToFrequency } from '@/lib/utils/formatters';
import { toast } from 'sonner';
import {
  Users, DollarSign, TrendingUp,
  CheckCircle, FileText
} from 'lucide-react';

export default function CircleDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuthStore();
  const { currentCircle, loading, fetchCircleDetails, makeContribution } = useCircleStore();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCircleDetails(parseInt(id));
    }
  }, [id, fetchCircleDetails]);

  const handleContribute = async () => {
    try {
      const nextRound = (currentCircle?.currentRound || 0) + 1;
      await makeContribution(
        parseInt(id),
        nextRound,
        parseFloat(currentCircle?.config?.contributionAmount || 0)
      );
      toast.success('Contribution successful!');
      setShowPaymentModal(false);
    } catch (error) {
      toast.error(error.message || 'Failed to contribute');
    }
  };

  if (loading || !currentCircle) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-600">Loading circle details...</p>
        </div>
      </Layout>
    );
  }

  const membersList = Object.values(currentCircle.members || {});
  const frequency = secondsToFrequency(currentCircle.config?.contributionFrequency);
  const progress = ((currentCircle.currentRound || 0) / (currentCircle.config?.totalRounds || 1)) * 100;
  const agreementCid = currentCircle.config?.agreementCID;
  const isMember = !!currentCircle.members?.[user?.addr];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentCircle.config?.name}
          </h1>
          <p className="text-gray-600">{currentCircle.config?.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center space-x-3 mb-2">
              <DollarSign className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900">Contribution</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(currentCircle.config?.contributionAmount || 0)}
            </p>
            <p className="text-sm text-gray-600 capitalize">{frequency}</p>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900">Progress</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              Round {currentCircle.currentRound || 0}/{currentCircle.config?.totalRounds || 0}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-primary-600 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3 mb-2">
              <Users className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900">Members</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{membersList.length}</p>
            <p className="text-sm text-gray-600">Active participants</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Members</h2>
            <div className="space-y-3">
              {membersList.map((member, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">
                        {member.address?.slice(0, 10)}...
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {member.roundsPaid?.length || 0}/{currentCircle.config?.totalRounds || 0}
                    </p>
                    <p className="text-xs text-gray-600">Paid</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Timeline</h2>
            <div className="space-y-4">
              {Array.from({ length: currentCircle.config?.totalRounds || 0 }, (_, i) => i + 1).map((round) => {
                const isPast = round < (currentCircle.currentRound || 0);
                const isCurrent = round === (currentCircle.currentRound || 0) + 1;
                
                return (
                  <div key={round} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isPast ? 'bg-green-100 text-green-600' :
                      isCurrent ? 'bg-primary-100 text-primary-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {isPast ? <CheckCircle className="w-5 h-5" /> : round}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Round {round}</p>
                      <p className="text-sm text-gray-600">
                        {isPast ? 'Completed' : isCurrent ? 'In Progress' : 'Upcoming'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {agreementCid && (
          <div className="card mt-6">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-primary-600 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Agreement Record</h2>
                <p className="text-sm text-gray-600 break-all">{agreementCid}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowPaymentModal(true)}
            disabled={!isMember}
            className="btn-primary px-8 py-3 text-lg"
          >
            {isMember ? 'Make Contribution' : 'Only Members Can Contribute'}
          </button>
        </div>

        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold mb-4">Make Contribution</h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-semibold">
                    {formatCurrency(currentCircle.config?.contributionAmount || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Round</span>
                  <span className="font-semibold">{(currentCircle.currentRound || 0) + 1}</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleContribute}
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
