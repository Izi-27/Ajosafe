import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuthStore from '@/store/authStore';
import { formatAddress } from '@/lib/utils/formatters';
import { LogOut, User, Wallet } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, authMethod, canTransact, logout } = useAuthStore();
  const identityLabel = user?.addr ? formatAddress(user.addr) : user?.email || 'Walletless User';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AjoSafe</span>
            </Link>

            {isAuthenticated && (
              <nav className="hidden md:flex space-x-6">
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    router.pathname === '/dashboard'
                      ? 'text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </Link>
                {canTransact && (
                  <Link
                    href="/circles/create"
                    className={`text-sm font-medium transition-colors ${
                      router.pathname === '/circles/create'
                        ? 'text-primary-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Create Circle
                  </Link>
                )}
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {identityLabel}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-gray-500">
                    {authMethod === 'magic_link' ? 'Magic' : 'Flow'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
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
