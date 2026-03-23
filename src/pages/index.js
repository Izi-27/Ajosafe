import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import useAuthStore from '@/store/authStore';
import { Shield, Users, Zap, Lock, FileCheck, TrendingUp } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const features = [
    {
      icon: Shield,
      title: 'Rule-Based Transparency',
      description: 'Circle rules, member status, and contribution progress are visible to everyone.',
    },
    {
      icon: Zap,
      title: 'Structured Circle Lifecycle',
      description: 'Circles start pending and become active only after all listed members acknowledge.',
    },
    {
      icon: Lock,
      title: 'Immutable Rules',
      description: 'Circle agreements stored on Filecoin. Everyone signs, no one can change terms.',
    },
    {
      icon: Users,
      title: 'Onboarding Path',
      description: 'Magic Link walletless login is now available, with Flow Wallet kept for full onchain actions.',
    },
    {
      icon: FileCheck,
      title: 'Transparent History',
      description: 'All transactions on-chain. Complete audit trail for every contribution and payout.',
    },
    {
      icon: TrendingUp,
      title: 'Due-Date Enforcement',
      description: 'Contributions are blocked before due date in UI and in contract checks.',
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Create Your Circle',
      description: 'Set contribution amount, frequency, and invite members. Rules are locked in a smart contract.',
    },
    {
      step: 2,
      title: 'Members Acknowledge',
      description: 'The circle remains pending until every listed member acknowledges the agreement.',
    },
    {
      step: 3,
      title: 'Contribute Each Round',
      description: 'Make your contribution on schedule. Smart contract tracks all payments automatically.',
    },
    {
      step: 4,
      title: 'Receive Your Payout',
      description: 'When it\'s your turn, funds are sent automatically. No waiting, no chasing.',
    },
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-br from-primary-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
              Ajo That Can't Run Away With Your Money
            </h1>
            <p className="text-xl text-gray-600 mb-8 animate-slide-up">
              Transform traditional Nigerian savings circles into automated, theft-proof smart contracts. 
              Save together, trust the code, not just people.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link href="/auth">
                <button className="btn-primary text-lg px-8 py-3">
                  Get Started
                </button>
              </Link>
              <Link href="#how-it-works">
                <button className="btn-outline text-lg px-8 py-3">
                  How It Works
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why AjoSafe?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Traditional Ajo circles work on trust. AjoSafe adds technology to make them safer and more reliable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="card group hover:border-primary-200 border border-transparent transition-all">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                <feature.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="how-it-works" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Four simple steps to safer, automated savings circles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
                {idx < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-primary-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Saving Safely?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands using AjoSafe to save together without the risk of theft or defaults.
          </p>
          <Link href="/auth">
            <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              Create Your First Circle
            </button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
