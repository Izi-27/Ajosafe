import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuthStore from '@/store/authStore';
import { formatAddress } from '@/lib/utils/formatters';
import { LogOut, User, Wallet } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, authMethod, authMode, canTransact, logout } = useAuthStore();
  const identityLabel = user?.addr ? formatAddress(user.addr) : user?.email || 'Walletless User';
  const modeLabel = authMode === 'flow_linked_hybrid'
    ? 'Hybrid'
    : authMethod === 'magic_link'
      ? 'Magic'
      : 'Flow';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="section-shell">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-700 shadow-sm">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900 leading-none">AjoSafe</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.18em]">Circle Finance</p>
              </div>
            </Link>

            {isAuthenticated && (
              <nav className="hidden md:flex space-x-6">
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    router.pathname === '/dashboard'
                      ? 'text-primary-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dashboard
                </Link>
                {canTransact && (
                  <Link
                    href="/circles/create"
                    className={`text-sm font-medium transition-colors ${
                      router.pathname === '/circles/create'
                        ? 'text-primary-700'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Create Circle
                  </Link>
                )}
                <Link href="/#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  How It Works
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50">
                  <User className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-800">
                    {identityLabel}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-slate-500">
                    {modeLabel}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link href="/auth">
                <button className="btn-primary">
                  Get Started
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
