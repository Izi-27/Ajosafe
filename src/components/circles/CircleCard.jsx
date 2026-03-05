import Link from 'next/link';
import { formatCurrency, formatTimeDistance, secondsToFrequency } from '@/lib/utils/formatters';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';

export default function CircleCard({ circle }) {
  const getStatusColor = (status) => {
    const colors = {
      0: 'bg-green-100 text-green-800',
      1: 'bg-yellow-100 text-yellow-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors[0];
  };

  const getStatusText = (status) => {
    const texts = {
      0: 'Active',
      1: 'Paused',
      2: 'Completed',
      3: 'Dissolved',
    };
    return texts[status] || 'Unknown';
  };

  const memberCount = Object.keys(circle.members || {}).length;
  const frequency = secondsToFrequency(circle.config?.contributionFrequency);
  const progress = ((circle.currentRound || 0) / (circle.config?.totalRounds || 1)) * 100;

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
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(circle.status)}`}>
          {getStatusText(circle.status)}
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

      {circle.nextPayoutTime && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600 font-medium">Next Payout</p>
          <p className="text-sm text-blue-900">
            {formatTimeDistance(new Date(circle.nextPayoutTime * 1000))}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex -space-x-2">
          {Object.values(circle.members || {}).slice(0, 4).map((member, idx) => (
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
            View Details ->
          </button>
        </Link>
      </div>
    </div>
  );
}
