import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import useAuthStore from '@/store/authStore';
import {
  ArrowRight,
  CalendarClock,
  FileCheck,
  Lock,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Shared Rule Visibility',
    description: 'Everyone sees the same contribution terms, payout order, and member state.',
  },
  {
    icon: Lock,
    title: 'Agreement Record On Filecoin',
    description: 'Circle agreements are stored through Synapse so terms can be checked later.',
  },
  {
    icon: CalendarClock,
    title: 'Due-Date Guard Rails',
    description: 'Contributions open based on schedule. Early payments are blocked in UI and contract checks.',
  },
  {
    icon: Users,
    title: 'Pending To Active Lifecycle',
    description: 'New circles stay pending until all listed members acknowledge the agreement.',
  },
  {
    icon: FileCheck,
    title: 'Auditable Circle Timeline',
    description: 'Contribution rounds, progress, and key statuses are visible from one circle page.',
  },
  {
    icon: Sparkles,
    title: 'Walletless Onboarding Path',
    description: 'Magic Link sign-in is live now, with deeper walletless transaction support in roadmap.',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Create circle terms',
    text: 'Set contribution amount, frequency, members, and penalty settings.',
  },
  {
    number: '02',
    title: 'Store and acknowledge agreement',
    text: 'Agreement record goes to Filecoin. Members acknowledge before activation.',
  },
  {
    number: '03',
    title: 'Contribute by round schedule',
    text: 'Members pay when due. Progress updates are visible to everyone in the circle.',
  },
  {
    number: '04',
    title: 'Track payout sequence',
    text: 'Round state and payout order remain transparent for every member.',
  },
];

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <Layout>
      <section className="section-shell pt-10 pb-16">
        <div className="glass-banner p-8 md:p-12 overflow-hidden relative">
          <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-cyan-200/40 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blue-300/30 blur-3xl" />
          <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase text-sky-700 bg-sky-50 border border-sky-200 rounded-full px-3 py-1">
                <Sparkles className="w-3.5 h-3.5" />
                PL Genesis Hackathon Build
              </p>
              <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
                Ajo circles with clearer rules, shared records, and less dispute risk.
              </h1>
              <p className="mt-5 text-lg text-slate-600 max-w-2xl">
                AjoSafe helps groups run savings circles with visible terms, transparent progress, and
                agreement records stored on Filecoin.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/auth">
                  <button className="btn-primary w-full sm:w-auto px-6 py-3 inline-flex items-center justify-center gap-2">
                    Start With AjoSafe
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="#how-it-works">
                  <button className="btn-secondary w-full sm:w-auto px-6 py-3">See How It Works</button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Current Hack Focus</p>
                <p className="mt-2 text-slate-900 font-semibold">
                  Transparent circle lifecycle from creation to acknowledgement to contribution.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Stack</p>
                <p className="mt-2 text-slate-900 font-semibold">Flow + Cadence + Filecoin (Synapse) + Next.js</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Post-Hack Direction</p>
                <p className="mt-2 text-slate-900 font-semibold">
                  Stronger enforcement, deeper walletless actions, and smoother non-technical onboarding.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pb-16">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">What is live in the MVP</h2>
          <p className="mt-3 text-slate-600">
            The product is focused on helping members see and follow shared rules with clear status updates.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((item) => (
            <article key={item.title} className="card hover:-translate-y-0.5">
              <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="section-shell pb-20">
        <div className="glass-banner p-8 md:p-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">How it works</h2>
          <p className="mt-3 text-slate-600">
            Four clear stages for every circle, designed to be understandable even for first-time users.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {STEPS.map((step) => (
              <div key={step.number} className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-sky-700 font-semibold">{step.number}</p>
                <h3 className="mt-2 text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
