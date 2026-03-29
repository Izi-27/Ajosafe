import Link from 'next/link';
import { Github, Twitter, FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 mt-auto border-t border-slate-900">
      <div className="section-shell py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white text-lg font-bold mb-4">AjoSafe</h3>
            <p className="text-sm text-slate-400 mb-4 max-w-xl">
              Transparent savings circles for real communities. Built on Flow for shared circle state and on Filecoin
              for durable agreement records.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/Izi-27/Ajosafe" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://x.com/its__izi_" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
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
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
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
                <a
                  href="https://github.com/Izi-27/Ajosafe/blob/main/README.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Project Readme
                </a>
              </li>
              <li>
                <Link href="/auth" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-sm text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} AjoSafe. Built for PL_Genesis Hackathon.</p>
          <p className="mt-2">Powered by Flow + Filecoin (Synapse)</p>
        </div>
      </div>
    </footer>
  );
}
