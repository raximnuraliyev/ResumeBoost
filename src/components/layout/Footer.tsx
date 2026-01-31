import Link from 'next/link'
import { Github, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img src="/logo.ico" alt="ResumeBoost" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold text-white">
                Resume<span className="text-indigo-400">Boost</span>
              </span>
            </div>
            <p className="text-sm text-gray-400">
              AI-powered CV building and interview preparation for software engineers.
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/cv-maker" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">
                  CV Maker
                </Link>
              </li>
              <li>
                <Link href="/cv-analyzer" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">
                  CV Analyzer
                </Link>
              </li>
              <li>
                <Link href="/interview" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">
                  Interview Ready Checker
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/issues" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">
                  Report an Issue
                </Link>
              </li>
              <li>
                <span className="text-sm text-gray-500">No account needed</span>
              </li>
              <li>
                <span className="text-sm text-gray-500">Session-based privacy</span>
              </li>
            </ul>
          </div>

          {/* Creators */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Created By</h3>
            <div className="space-y-3">
              <a
                href="https://github.com/raximnuraliyev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-gray-400 hover:text-indigo-400 transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>ajaxmanson</span>
              </a>
              <a
                href="https://github.com/yevgenevic"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-gray-400 hover:text-indigo-400 transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>yevgenevic</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} ResumeBoost. Built for engineers, by engineers.
            </p>
            <p className="flex items-center space-x-1 text-sm text-gray-500">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>by</span>
              <a href="https://github.com/raximnuraliyev" className="text-indigo-400 hover:underline">ajaxmanson</a>
              <span>&</span>
              <a href="https://github.com/yevgenevic" className="text-indigo-400 hover:underline">yevgenevic</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
