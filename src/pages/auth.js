import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import useAuthStore from '@/store/authStore';
import { Wallet, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const { isAuthenticated, login, loginWithMagicLink, loading } = useAuthStore();

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

  const handleMagicLinkLogin = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Enter a valid email address to continue with Magic Link.');
      return;
    }

    try {
      await loginWithMagicLink(email.trim());
      toast.success('Magic Link login successful.');
    } catch (error) {
      toast.error(error?.message || 'Magic Link login failed.');
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Start With AjoSafe</h1>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Choose wallet login for full onchain actions, or use Magic Link for walletless onboarding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-primary-700" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Connect Flow Wallet</h2>
            <p className="text-sm text-gray-600 mt-2">
              Full access mode. Required for creating circles, acknowledging agreements, and contributing on testnet.
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
              Sign in with your email to start without a wallet. You can connect a Flow wallet afterwards for
              transactions.
            </p>
            <div className="mt-6 space-y-3">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="input"
                placeholder="you@example.com"
              />
              <button
                onClick={handleMagicLinkLogin}
                disabled={loading}
                className="btn-outline w-full disabled:opacity-50"
              >
                {loading ? 'Sending Magic Link...' : 'Continue With Magic Link'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          Walletless login is now enabled. Flow wallet remains required for onchain transactions until account-linking
          is added.
        </div>
      </div>
    </Layout>
  );
}

