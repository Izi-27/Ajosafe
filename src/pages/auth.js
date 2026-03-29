import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import useAuthStore from '@/store/authStore';
import { Mail, Wallet, ArrowRight, ShieldCheck } from 'lucide-react';
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
      <section className="section-shell py-12 md:py-16">
        <div className="max-w-5xl mx-auto glass-banner p-6 md:p-10">
          <div className="text-center max-w-3xl mx-auto">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase text-sky-700 bg-sky-50 border border-sky-200 rounded-full px-3 py-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Choose your access mode
            </p>
            <h1 className="mt-4 text-3xl md:text-5xl font-extrabold text-slate-900">Sign in to AjoSafe</h1>
            <p className="mt-3 text-slate-600">
              Start with email if you are new to wallets, or connect a Flow wallet for full transaction access.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">Walletless Start (Magic Link)</h2>
              <p className="mt-2 text-sm text-slate-600">
                Use email OTP to enter quickly. You can still link a wallet later for full self-custody controls.
              </p>
              <div className="mt-5 space-y-3">
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
                  className="btn-outline w-full inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Sending Magic Link...' : 'Continue with Email'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">Flow Wallet Mode</h2>
              <p className="mt-2 text-sm text-slate-600">
                Best for creators and members who want to run full onchain actions directly from their wallet.
              </p>
              <button
                onClick={handleWalletLogin}
                disabled={loading}
                className="btn-primary w-full mt-5 inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Connect Flow Wallet'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </article>
          </div>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Hackathon scope note: walletless login is live now; circle creation still requires Flow wallet mode in this MVP.
          </div>
        </div>
      </section>
    </Layout>
  );
}
