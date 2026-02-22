import Link from 'next/link';
import { Github, Twitter, FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white text-lg font-bold mb-4">AjoSafe</h3>
            <p className="text-sm text-gray-400 mb-4">
              Ajo that can't run away with your money. Transform traditional savings circles into automated, theft-proof smart contracts on Flow blockchain.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/circles/create" className="hover:text-white transition-colors">
                  Create Circle
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://developers.flow.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Flow Docs
                </a>
              </li>
              <li>
                <a href="https://filecoin.io" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Filecoin
                </a>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} AjoSafe. Built for PL_Genesis Hackathon.</p>
          <p className="mt-2">Powered by Flow, Filecoin, and Web3Auth</p>
        </div>
      </div>
    </footer>
  );
}
