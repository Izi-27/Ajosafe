import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import CircleCard from '@/components/circles/CircleCard';
import useAuthStore from '@/store/authStore';
import useCircleStore from '@/store/circleStore';
import { PlusCircle, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, canTransact, authMethod, login } = useAuthStore();
  const { circles, loading, fetchUserCircles } = useCircleStore();
  const canViewCircles = Boolean(user?.addr);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    } else if (canViewCircles) {
      fetchUserCircles(user.addr);
    }
  }, [isAuthenticated, canViewCircles, user, router, fetchUserCircles]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Circles</h1>
            <p className="text-gray-600 mt-2">
              Manage your savings circles and track contributions
            </p>
          </div>
          {canTransact && (
            <Link href="/circles/create">
              <button className="btn-primary flex items-center space-x-2">
                <PlusCircle className="w-5 h-5" />
                <span>Create Circle</span>
              </button>
            </Link>
          )}
        </div>

        {!canViewCircles ? (
          <div className="max-w-2xl mx-auto text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Connect Flow Wallet To Continue</h2>
            <p className="text-gray-600 mb-6">
              You are signed in with {authMethod === 'magic_link' ? 'Magic Link' : 'an unsupported method'}. Connect
              Flow Wallet to create circles and run onchain actions.
            </p>
            <button onClick={login} className="btn-primary">
              Connect Flow Wallet
            </button>
          </div>
        ) : authMethod === 'magic_link' && !canTransact ? (
          <>
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              Walletless mode is active. You can view circles and perform sponsored acknowledgement/contribution where eligible.
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              </div>
            ) : circles.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PlusCircle className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">No circles yet</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Join a circle invite first, or connect Flow Wallet to create a new circle.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {circles.map((circle) => (
                  <CircleCard key={circle.id} circle={circle} />
                ))}
              </div>
            )}
          </>
        ) : loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : circles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <PlusCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No circles yet
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create your first savings circle to start saving together with friends and family
            </p>
            <Link href="/circles/create">
              <button className="btn-primary">Create Your First Circle</button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {circles.map((circle) => (
              <CircleCard key={circle.id} circle={circle} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
