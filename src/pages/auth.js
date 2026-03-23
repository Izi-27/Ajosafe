import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import useAuthStore from '@/store/authStore';
import { Wallet, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, login, loading } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleWalletLogin = async () => {
    try {
      await login();
    } catch (error) {
      toast.error(error?.message || 'Failed to connect wallet');
    }
  };

  const handleWalletlessPreview = () => {
    toast.info(
      'Walletless onboarding (Magic Link) is planned next. For now, continue with Flow Wallet to use all features.'
    );
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Start With AjoSafe</h1>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Use Flow Wallet today for full access. Walletless onboarding is planned as the next release step.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-primary-700" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Connect Flow Wallet</h2>
            <p className="text-sm text-gray-600 mt-2">
              This is the active login method. Required for creating circles, acknowledging agreements, and
              contributing on testnet.
            </p>
            <button
              onClick={handleWalletLogin}
              disabled={loading}
              className="btn-primary mt-6 inline-flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Continue With Flow Wallet'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-gray-700" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Walletless (Magic Link)</h2>
            <p className="text-sm text-gray-600 mt-2">
              Planned onboarding path for non-crypto-native users. This will allow starting with email and linking a
              wallet later.
            </p>
            <button onClick={handleWalletlessPreview} className="btn-outline mt-6">
              View Rollout Plan
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          Next rollout target: Magic Link onboarding, then hybrid custody/account linking for advanced users.
        </div>
      </div>
    </Layout>
  );
}
