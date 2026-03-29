import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import CircleCard from '@/components/circles/CircleCard';
import useAuthStore from '@/store/authStore';
import useCircleStore from '@/store/circleStore';
import { PlusCircle, Loader2, Sparkles } from 'lucide-react';

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
      <section className="section-shell py-8 md:py-10">
        <div className="glass-banner p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase text-sky-700 bg-sky-50 border border-sky-200 rounded-full px-3 py-1">
                <Sparkles className="w-3.5 h-3.5" />
                Your circle workspace
              </p>
              <h1 className="mt-4 text-3xl md:text-4xl font-extrabold text-slate-900">Your Circles</h1>
              <p className="mt-2 text-slate-600">Track round progress, due dates, and agreement status from one place.</p>
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
        </div>

        {!canViewCircles ? (
          <div className="max-w-2xl mx-auto mt-8 text-center card">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Connect Flow Wallet To Continue</h2>
            <p className="text-slate-600 mb-6">
              You are signed in with {authMethod === 'magic_link' ? 'Magic Link' : 'an unsupported method'}.
              Connect Flow Wallet to create circles and run onchain actions.
            </p>
            <button onClick={login} className="btn-primary">
              Connect Flow Wallet
            </button>
          </div>
        ) : authMethod === 'magic_link' && !canTransact ? (
          <>
            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              Walletless mode is active. You can view circles and perform sponsored acknowledgement/contribution where
              eligible.
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              </div>
            ) : circles.length === 0 ? (
              <div className="text-center py-16">
                <div className="card max-w-xl mx-auto">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PlusCircle className="w-10 h-10 text-slate-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-900 mb-2">No circles yet</h2>
                  <p className="text-slate-600">
                    Join a circle invite first, or connect Flow Wallet to create a new circle.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
          <div className="text-center py-16">
            <div className="card max-w-xl mx-auto">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <PlusCircle className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">No circles yet</h2>
              <p className="text-slate-600 mb-8">
                Create your first savings circle to start saving together with friends and family.
              </p>
              <Link href="/circles/create">
                <button className="btn-primary">Create Your First Circle</button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {circles.map((circle) => (
              <CircleCard key={circle.id} circle={circle} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
