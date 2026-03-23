import Link from 'next/link';
import {
  formatCurrency,
  formatFlowTimestamp,
  formatTimeDistance,
  flowTimestampToDate,
  isFlowTimestampDue,
  secondsToFrequency,
} from '@/lib/utils/formatters';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';

export default function CircleCard({ circle }) {
  const nextDueDate = flowTimestampToDate(circle.nextPayoutTime);
  const nextDueAt = circle.nextPayoutTime;
  const isDue = isFlowTimestampDue(nextDueAt);
  const members = Object.values(circle.members || {});
  const memberCount = members.length;
  const acknowledgementCount = members.filter((member) => member.depositPaid).length;

  const parseCircleStatus = (status) => {
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
  };

  const statusCode = parseCircleStatus(circle.status);
  const isPendingAcknowledgement =
    statusCode === 4 ||
    (statusCode === null && acknowledgementCount < memberCount && !nextDueAt);
  const normalizedStatusCode = isPendingAcknowledgement ? 4 : statusCode ?? 0;
  const isCompleted = normalizedStatusCode === 2;

  const getStatusColor = (status) => {
    const colors = {
      0: 'bg-green-100 text-green-800',
      1: 'bg-orange-100 text-orange-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-gray-100 text-gray-800',
      4: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || colors[0];
  };

  const getStatusText = (status) => {
    const texts = {
      0: 'Active',
      1: 'Paused',
      2: 'Completed',
      3: 'Dissolved',
      4: 'Pending Acknowledgement',
    };
    return texts[status] || 'Unknown';
  };

  const frequency = secondsToFrequency(circle.config?.contributionFrequency);
  const progress = ((circle.currentRound || 0) / (circle.config?.totalRounds || 1)) * 100;

  const nextDueSummary = isPendingAcknowledgement
    ? 'Pending activation'
    : isCompleted
      ? 'No further payments'
      : !nextDueDate
        ? 'Schedule pending'
        : isDue
          ? `Due now (${formatFlowTimestamp(nextDueAt)})`
          : formatTimeDistance(nextDueDate);

  const nextDueDetail = isPendingAcknowledgement
    ? `${acknowledgementCount}/${memberCount} members acknowledged`
    : isCompleted
      ? 'Circle completed successfully'
      : !nextDueDate
        ? 'Waiting for schedule update'
        : isDue
          ? 'Contribution window is open'
          : `Opens ${formatFlowTimestamp(nextDueAt, 'PPP p')}`;

  return (
    <div className="card group hover:shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {circle.config?.name || 'Unnamed Circle'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {circle.config?.description || 'No description'}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(normalizedStatusCode)}`}>
          {getStatusText(normalizedStatusCode)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Contribution</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(circle.config?.contributionAmount || 0)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Frequency</p>
            <p className="font-semibold text-gray-900 capitalize">{frequency}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Members</p>
            <p className="font-semibold text-gray-900">{memberCount}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Progress</p>
            <p className="font-semibold text-gray-900">
              Round {circle.currentRound || 0}/{circle.config?.totalRounds || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>{progress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-600 font-medium">Next Due Date</p>
        <p className="text-sm text-blue-900 font-semibold">{nextDueSummary}</p>
        <p className="text-xs text-blue-700 mt-1">{nextDueDetail}</p>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex -space-x-2">
          {members.slice(0, 4).map((member, idx) => (
            <div
              key={idx}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
            >
              {member.name?.charAt(0).toUpperCase() || '?'}
            </div>
          ))}
          {memberCount > 4 && (
            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-semibold">
              +{memberCount - 4}
            </div>
          )}
        </div>

        <Link href={`/circles/${circle.id}`}>
          <button className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors">
            View Details {'->'}
          </button>
        </Link>
      </div>
    </div>
  );
}
