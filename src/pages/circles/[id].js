import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import useCircleStore from '@/store/circleStore';
import useAuthStore from '@/store/authStore';
import {
  formatAddress,
  formatCurrency,
  formatFlowTimestamp,
  isFlowTimestampDue,
  normalizeFlowTimestamp,
  secondsToFrequency,
} from '@/lib/utils/formatters';
import { getAgreementFromFilecoin } from '@/lib/filecoin/storage';
import { toast } from 'sonner';
import {
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  FileText,
  ShieldCheck,
  CalendarClock,
} from 'lucide-react';

const STATUS_META = {
  0: {
    label: 'Active',
    badge: 'bg-green-100 text-green-800',
    accent: 'text-green-700',
  },
  1: {
    label: 'Paused',
    badge: 'bg-orange-100 text-orange-800',
    accent: 'text-orange-700',
  },
  2: {
    label: 'Completed',
    badge: 'bg-blue-100 text-blue-800',
    accent: 'text-blue-700',
  },
  3: {
    label: 'Dissolved',
    badge: 'bg-gray-100 text-gray-800',
    accent: 'text-gray-700',
  },
  4: {
    label: 'Pending Acknowledgement',
    badge: 'bg-yellow-100 text-yellow-800',
    accent: 'text-yellow-700',
  },
};

function formatAgreementError(error) {
  const message = error?.message || 'Failed to load agreement details';

  if (
    message.includes('All provider retrieval attempts failed') ||
    message.includes('Too many promises rejected')
  ) {
    return 'The agreement is stored on Filecoin, but retrieval is still indexing. Refresh this page in a moment.';
  }

  return message;
}

function getStatusMeta(status) {
  return STATUS_META[status] || STATUS_META[4];
}

function normalizeAddress(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return '';
  }

  return trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`;
}

function parseCircleStatus(status) {
  if (typeof status === 'number' && Number.isFinite(status)) {
    return status;
  }

  if (typeof status === 'string') {
    if (/^\d+$/.test(status)) {
      return parseInt(status, 10);
    }

    const mapped = {
      ACTIVE: 0,
      PAUSED: 1,
      COMPLETED: 2,
      DISSOLVED: 3,
      PENDING_ACKNOWLEDGEMENT: 4,
    };

    return mapped[status] ?? null;
  }

  if (status && typeof status === 'object') {
    if ('rawValue' in status) {
      return parseCircleStatus(status.rawValue);
    }
    if ('value' in status) {
      return parseCircleStatus(status.value);
    }
    if ('case' in status) {
      return parseCircleStatus(status.case);
    }
  }

  return null;
}

function buildRoundSchedule(circle) {
  const status = parseCircleStatus(circle?.status);
  const activationTime =
    status === 4 ? null : normalizeFlowTimestamp(circle?.lastPayoutTime);
  const contributionFrequency = Number(circle?.config?.contributionFrequency || 0);
  const totalRounds = Number(circle?.config?.totalRounds || 0);

  return Array.from({ length: totalRounds }, (_, index) => {
    const round = index + 1;
    const dueAt =
      activationTime === null ? null : activationTime + contributionFrequency * round;

    return {
      round,
      dueAt,
      isCompleted: round <= Number(circle?.currentRound || 0),
      isCurrent: round === Number(circle?.currentRound || 0) + 1,
    };
  });
}

export default function CircleDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuthStore();
  const {
    currentCircle,
    loading,
    fetchCircleDetails,
    makeContribution,
    acknowledgeAgreement,
  } = useCircleStore();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [agreement, setAgreement] = useState(null);
  const [agreementLoading, setAgreementLoading] = useState(false);
  const [agreementError, setAgreementError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchCircleDetails(parseInt(id, 10));
    }
  }, [id, fetchCircleDetails]);

  useEffect(() => {
    const agreementCid = currentCircle?.config?.agreementCID;

    if (!agreementCid) {
      setAgreement(null);
      setAgreementError(null);
      return;
    }

    let active = true;

    const loadAgreement = async () => {
      setAgreementLoading(true);
      setAgreementError(null);

      try {
        const data = await getAgreementFromFilecoin(agreementCid);
        if (active) {
          setAgreement(data);
        }
      } catch (error) {
        if (active) {
          setAgreement(null);
          setAgreementError(formatAgreementError(error));
        }
      } finally {
        if (active) {
          setAgreementLoading(false);
        }
      }
    };

    loadAgreement();

    return () => {
      active = false;
    };
  }, [currentCircle?.config?.agreementCID]);

  const membersList = useMemo(
    () => Object.values(currentCircle?.members || {}),
    [currentCircle?.members]
  );

  const normalizedUserAddress = normalizeAddress(user?.addr);
  const currentMember = useMemo(() => {
    if (!normalizedUserAddress) {
      return null;
    }

    return (
      membersList.find((member) => normalizeAddress(member?.address) === normalizedUserAddress) || null
    );
  }, [membersList, normalizedUserAddress]);

  const statusCode = parseCircleStatus(currentCircle?.status);
  const statusMeta = getStatusMeta(statusCode ?? 4);
  const frequency = secondsToFrequency(currentCircle?.config?.contributionFrequency);
  const agreementCid = currentCircle?.config?.agreementCID;
  const progress =
    ((Number(currentCircle?.currentRound || 0) / Number(currentCircle?.config?.totalRounds || 1)) || 0) * 100;
  const isMember = !!currentMember;
  const needsAcknowledgement = isMember && !currentMember?.depositPaid;
  const acknowledgementCount = membersList.filter((member) => member.depositPaid).length;
  const isCirclePending =
    statusCode === 4 ||
    (statusCode === null &&
      Number(acknowledgementCount) < Number(membersList.length) &&
      !currentCircle?.nextPayoutTime);
  const isCircleActive = statusCode === 0;
  const isCircleCompleted = statusCode === 2;
  const nextDueAt = currentCircle?.nextPayoutTime;
  const isPaymentDue = isFlowTimestampDue(nextDueAt);
  const roundSchedule = useMemo(() => buildRoundSchedule(currentCircle), [currentCircle]);
  const activationTime = !isCirclePending
    ? normalizeFlowTimestamp(currentCircle?.lastPayoutTime)
    : null;
  const firstDueTime =
    activationTime !== null
      ? activationTime + Number(currentCircle?.config?.contributionFrequency || 0)
      : null;
  const memberAddressList = membersList.map((member) => member?.address).filter(Boolean);

  const handleAcknowledgeAgreement = async () => {
    if (!isMember) {
      toast.error('Only circle members can acknowledge the agreement.');
      return;
    }

    if (!agreementCid) {
      toast.error('Agreement record is not available for this circle yet.');
      return;
    }

    try {
      const { warning } = await acknowledgeAgreement({
        circleId: parseInt(id, 10),
        agreementCid,
        memberAddress: currentMember.address,
        memberName: currentMember.name,
      });

      toast.success('Agreement acknowledged successfully.');
      if (warning) {
        toast.warning(warning);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to acknowledge agreement');
    }
  };

  const handleOpenContribution = () => {
    if (!isMember) {
      toast.error('Only members of this circle can contribute.');
      return;
    }

    if (isCirclePending) {
      toast.error('This circle is pending acknowledgement from all members before it can become active.');
      return;
    }

    if (!currentMember?.depositPaid) {
      toast.error('You must acknowledge the agreement before making a payment.');
      return;
    }

    if (!nextDueAt) {
      toast.error('Payment schedule is not ready yet.');
      return;
    }

    if (!isPaymentDue) {
      toast.error(`You can't make payment until the due date: ${formatFlowTimestamp(nextDueAt)}`);
      return;
    }

    setShowPaymentModal(true);
  };

  const handleContribute = async () => {
    try {
      if (!nextDueAt || !isFlowTimestampDue(nextDueAt)) {
        toast.error(`You can't make payment until the due date: ${formatFlowTimestamp(nextDueAt)}`);
        return;
      }

      const nextRound = Number(currentCircle?.currentRound || 0) + 1;
      await makeContribution(
        parseInt(id, 10),
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentCircle.config?.name}
              </h1>
              <p className="text-gray-600">{currentCircle.config?.description}</p>
            </div>
            <span className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${statusMeta.badge}`}>
              {statusMeta.label}
            </span>
          </div>
        </div>

        {isCirclePending && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-900">
              Connected wallet: <span className="font-semibold">{formatAddress(user?.addr || '')}</span>
            </p>
            {!isMember ? (
              <>
                <p className="mt-2 text-sm text-yellow-900">
                  This wallet is not in the circle member list. Switch wallet to acknowledge the agreement.
                </p>
                <p className="mt-2 text-xs text-yellow-800 break-all">
                  Members: {memberAddressList.join(', ')}
                </p>
              </>
            ) : needsAcknowledgement ? (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <p className="text-sm text-yellow-900">
                  Your acknowledgement is pending. Click below to activate this circle.
                </p>
                <button
                  onClick={handleAcknowledgeAgreement}
                  disabled={loading}
                  className="btn-primary whitespace-nowrap"
                >
                  {loading ? 'Acknowledging...' : 'Acknowledge Agreement'}
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-yellow-900">
                You already acknowledged. Waiting for other members to acknowledge.
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center space-x-3 mb-2">
              <ShieldCheck className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900">Status</h3>
            </div>
            <p className={`text-xl font-bold ${statusMeta.accent}`}>{statusMeta.label}</p>
            <p className="text-sm text-gray-600 mt-1">
              {acknowledgementCount}/{membersList.length} acknowledged
            </p>
          </div>

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
              <CalendarClock className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900">Next Due Date</h3>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {nextDueAt ? formatFlowTimestamp(nextDueAt) : 'Pending activation'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {isCirclePending
                ? 'Starts once all members acknowledge'
                : isCircleCompleted
                  ? 'No further payments are due'
                : isPaymentDue
                  ? 'Payments are now open'
                  : 'Payments open on the due date'}
            </p>
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
                    <p className={`text-sm font-medium ${member.depositPaid ? 'text-green-700' : 'text-yellow-700'}`}>
                      {member.depositPaid ? 'Acknowledged' : 'Pending'}
                    </p>
                    <p className="text-xs text-gray-600">
                      Paid {member.roundsPaid?.length || 0}/{currentCircle.config?.totalRounds || 0}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Timeline</h2>
            <div className="space-y-4">
              {roundSchedule.map((entry) => {
                const isDue = isFlowTimestampDue(entry.dueAt);

                return (
                  <div key={entry.round} className="flex items-start space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        entry.isCompleted
                          ? 'bg-green-100 text-green-600'
                          : entry.isCurrent && isCircleActive
                            ? 'bg-primary-100 text-primary-600'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {entry.isCompleted ? <CheckCircle className="w-5 h-5" /> : entry.round}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Round {entry.round}</p>
                      <p className="text-sm text-gray-600">
                        {entry.isCompleted
                          ? 'Completed'
                          : isCirclePending
                            ? 'Starts after all members acknowledge'
                            : entry.isCurrent
                              ? isDue
                                ? `Due now since ${formatFlowTimestamp(entry.dueAt)}`
                                : `Due on ${formatFlowTimestamp(entry.dueAt)}`
                              : `Scheduled for ${formatFlowTimestamp(entry.dueAt)}`}
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
              <div className="w-full">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Agreement Record</h2>
                    <p className="text-sm text-gray-600 break-all">{agreementCid}</p>
                  </div>
                  {isMember && isCirclePending && needsAcknowledgement && (
                    <button
                      onClick={handleAcknowledgeAgreement}
                      disabled={loading}
                      className="btn-primary whitespace-nowrap"
                    >
                      {loading ? 'Acknowledging...' : 'Acknowledge Agreement'}
                    </button>
                  )}
                </div>

                {agreementLoading && (
                  <p className="text-sm text-gray-500 mt-3">Loading agreement details from Filecoin...</p>
                )}
                {agreementError && (
                  <p className="text-sm text-red-600 mt-3">{agreementError}</p>
                )}
                {agreement && (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Stored Terms</p>
                        <p className="font-medium text-gray-900">{agreement.terms}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Agreement Members</p>
                        <p className="font-medium text-gray-900">{agreement.members?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Contribution Rule</p>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(agreement.rules?.contributionAmount || 0)} / {agreement.rules?.frequency}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Penalty Rate</p>
                        <p className="font-medium text-gray-900">
                          {((agreement.rules?.penaltyRate || 0) * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Created On</p>
                        <p className="font-medium text-gray-900">
                          {formatFlowTimestamp(currentCircle.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Activation Date</p>
                        <p className="font-medium text-gray-900">
                          {activationTime
                            ? formatFlowTimestamp(activationTime)
                            : 'Pending all acknowledgements'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">First Due Date</p>
                        <p className="font-medium text-gray-900">
                          {firstDueTime
                            ? formatFlowTimestamp(firstDueTime)
                            : 'Scheduled after activation'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Acknowledgement Progress</p>
                        <p className="font-medium text-gray-900">
                          {acknowledgementCount}/{membersList.length} members acknowledged
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Round-by-round payment schedule</p>
                      <ul className="space-y-1 text-sm text-gray-900">
                        {roundSchedule.map((entry) => (
                          <li key={`round-due-${entry.round}`}>
                            Round {entry.round}: {entry.dueAt ? formatFlowTimestamp(entry.dueAt) : 'Pending activation'}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {agreement.members?.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Agreement Member List</p>
                        <ul className="space-y-1 text-sm text-gray-900">
                          {agreement.members.map((member, index) => (
                            <li key={`${member.address}-${index}`}>
                              {member.name} ({member.address})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <div className="flex flex-wrap justify-center gap-3">
            {isCirclePending && needsAcknowledgement && (
              <button
                onClick={handleAcknowledgeAgreement}
                disabled={loading}
                className="btn-primary px-8 py-3 text-lg"
              >
                {loading ? 'Acknowledging...' : 'Acknowledge Agreement'}
              </button>
            )}
            <button
              onClick={handleOpenContribution}
              className="btn-primary px-8 py-3 text-lg"
            >
              {!isMember
                ? 'Only Members Can Contribute'
                : isCirclePending
                  ? needsAcknowledgement
                    ? 'Acknowledge Agreement To Continue'
                    : 'Waiting For Member Acknowledgements'
                  : isCircleCompleted
                    ? 'Circle Completed'
                  : nextDueAt && !isPaymentDue
                    ? `Payment Opens ${formatFlowTimestamp(nextDueAt, 'PPP')}`
                    : 'Make Contribution'}
            </button>
          </div>
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
                  <span className="font-semibold">{Number(currentCircle.currentRound || 0) + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date</span>
                  <span className="font-semibold">{formatFlowTimestamp(nextDueAt)}</span>
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
